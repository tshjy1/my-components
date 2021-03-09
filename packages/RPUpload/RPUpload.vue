<template>
  <Upload
    v-bind="$attrs"
    :headers="headers"
    :with-credentials="true"
    :action="action"
    :default-file-list="defaultList"
    :on-remove="_deleteFile"
    :on-success="onSuccess"
    :on-exceeded-size="onExceededSize"
    :on-preview="_downloadFile"
    :show-upload-list="showUploadList"
    :before-upload="beforeUpload"
    :disabled="disabled"
    :on-error="onError"
  >
    <Button>{{ text }}</Button>
  </Upload>
</template>
<script>
import Locale from "../mixins/locale";
import { getServicePrefix } from "../vuex/action";
import { getHttpHeaders } from "../utils/http";
import { mapActions } from "vuex";

export default {
  data() {
    let headers = getHttpHeaders();
    delete headers["Content-Type"];
    let uploadText = this.$attrs.text || this.t("i.rp_upload.text");

    return {
      disabled: false,
      headers,
      uploadText,
      text: uploadText,
      action: this.servicePath || getServicePrefix("file") + "/fileClient/upload",
      fileBuffer: []
    };
  },
  props: {
    value: { type: Array, default: () => [] },
    servicePath: String,
    showUploadList: { type: Boolean, default: true },
    customErrorShow: Boolean
  },
  computed: {
    defaultList() {
      for (let item of this.value) {
        if (!item.name) {
          item.name = item.id;
        }
      }

      return this.value;
    }
  },
  mixins: [Locale],
  methods: {
    ...mapActions($moduleName, ["deleteFile", "downloadFile"]),
    regainStatus() {
      this.text = this.uploadText;
      this.disabled = false;
    },
    onError(error, response) {
      this.regainStatus();
      if (response) {
        if (this.customErrorShow) return this.$emit("uploadError", response)
        this.$message.error({
          content: this.t("i.rp_upload.upload_fail"),
          more: {
            traceId: response.traceId,
            code: response.code,
            msg: response.message
          }
        });
      }
    },
    beforeUpload() {
      this.text = this.t("i.rp_upload.uploading");
      this.disabled = true;
    },
    onSuccess(response, file, fileList) {
      this.regainStatus();
      this.$emit(
        "input",
        fileList.map(item => ({
          name: item.name,
          id: item.id || item.response
        }))
      );

      if (!this.showUploadList) {
        this.$message.success(this.t("i.rp_upload.upload_success"));
      }

      if (typeof this.$attrs["on-success"] === "function") {
        this.$attrs["on-success"](response, file, fileList);
      }
    },
    _deleteFile(fileInfo) {
      new $confirm(this.t("common.warning.confirmToDelete"), this).then(() => {
        let fileId = fileInfo.id || fileInfo.response;
        this.deleteFile({ fileId })
          .then(response => {
            if (response) {
              this.$message.success(this.t("i.rp_upload.delete_success"));
              this.$emit(
                "input",
                this.value
                  .filter(item => item.id !== fileId)
                  .map(item => ({
                    name: item.name,
                    id: item.id || item.response
                  }))
              );
            } else {
              this.$message.error(this.t("i.rp_upload.delete_failed"));
            }
          })
          .catch(e => this.$message.error(this.t("i.rp_upload.delete_failed")));
      });
    },
    _downloadFile(fileInfo) {
      fileInfo.fileId = fileInfo.id || fileInfo.response;
      this.downloadFile(fileInfo);
    },
    onExceededSize(fileInfo) {
      this.fileBuffer.push(fileInfo);
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        this.$message.error({
          content: this.t("i.rp_upload.fileExceededSize", [
            this.fileBuffer.map(item => item.name).join("] , ["),
            this.$attrs["max-size"]
          ]),
          duration: 10,
          closable: true
        });
        this.timer = null;
      }, 50);
    }
  }
};
</script>
<style lang="less">
.ivu-upload-list {
  line-height: 1;
  span {
    line-height: 1.5;
  }
}
</style>

