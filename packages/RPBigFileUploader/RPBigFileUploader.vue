<template>
  <uploader
    :options="uploaderOptions"
    :file-status-text="promptText"
    ref="uploader"
    class="uploader"
    @file-success="fileSuccess"
    @file-added="fileAdded"
    @files-submitted="filesSubmitted"
  >
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <p>{{promptText.dropPrompt}}</p>
      <span v-if="uploaderOptions.showSelectButton">{{t('i.rp_rfUploader.or')}}</span>
      <uploader-btn
        v-if="uploaderOptions.showSelectButton"
        :attrs="attrs"
      >{{promptText.selectPrompt}}</uploader-btn>
    </uploader-drop>
    <div class="uploader-list">
      <ul>
        <li v-if="loadingUploaded" class="loading-file-info">{{t('i.rp_rfUploader.loading')}}</li>
        <li v-else-if="!uploaded.length" class="loading-file-info">{{t('i.rp_rfUploader.noFile')}}</li>
        <li v-else v-for="file in uploaded" :key="file.uniqueIdentifier">
          <div class="uploader-file">
            <div class="uploader-file-progress" style="transform: translateX(0%);"></div>
            <div class="uploader-file-info">
              <div
                class="uploader-file-name"
                @click="download(file)"
                :title="t('i.rp_rfUploader.download')"
              >
                <i class="uploader-file-icon" :icon="fileCategory(file)"></i>
                <a href="javascript:void(0)">{{file.fileName}}</a>
              </div>
              <!-- <div class="uploader-file-size">{{formatedSize}}</div> -->
              <div class="uploader-file-size"></div>
              <div class="uploader-file-meta"></div>
              <div class="uploader-file-status">
                <span>{{promptText[file.status]}}</span>
              </div>
              <div class="uploader-file-actions">
                <span
                  class="uploader-file-remove"
                  :title="t('i.rp_rfUploader.delete')"
                  @click="deleteFile(file)"
                ></span>
              </div>
            </div>
          </div>
        </li>
        <li v-if="reading" class="loading-file-info">{{t('i.rp_rfUploader.reading')}}</li>
      </ul>
    </div>
    <uploader-list></uploader-list>
  </uploader>
</template>
<script>
import Locale from "../mixins/locale";
import { getHttpHeaders } from "../utils/http";

const URL = null // 请求地址
const defaultOptions = {
  target: "./fileUpload",
  testChunks: false,
  chunkSize: 1024 * 1024,
  maxChunkRetries: 4,
  simultaneousUploads: 4,
  permanentErrors: [],
  showSelectButton: true,
  checkChunkUploadedByResponse() {},
  generateUniqueIdentifier(file) {
    /* istanbul ignore next */
    // Some confusion in different versions of Firefox
    var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
    /* istanbul ignore next */
    return (file.size + "-" + new Date().getTime() + "-" + Math.random() + "-" + relativePath).replace(
      /[^0-9a-zA-Z_-]/gim,
      ""
    );
  }
};

export default {
  data() {
    let headers = getHttpHeaders();
    delete headers["Content-Type"];
    let { attributes } = this.options;
    if (attributes) {
      try {
        this.options.attributes = JSON.stringify(attributes);
      } catch (e) {
        console.error(e);
      }
    }

    if (this.options.headers) {
      this.options.headers = Object.assign({}, this.options.headers, headers);
    } else {
      this.options = Object.assign({}, this.options, { headers });
    }

    return {
      reading: false,
      uploaded: [],
      loadingUploaded: false,
      uploaderOptions: Object.assign({}, defaultOptions, this.options, {
        preprocess: this.preprocess.bind(this),
        processResponse: this.processResponse.bind(this),
        processParams: this.processParams.bind(this)
      })
    };
  },
  mixins: [Locale],
  props: {
    uploadedFiles: { type: Array, default: [] },
    attrs: Object,
    options: Object,
    promptText: {
      type: Object,
      default: () => {
        const t = Locale.methods.t;
        return {
          success: t("i.rp_rfUploader.success"),
          error: t("i.rp_rfUploader.error"),
          uploading: t("i.rp_rfUploader.uploading"),
          paused: t("i.rp_rfUploader.paused"),
          waiting: t("i.rp_rfUploader.waiting"),
          dropPrompt: t("i.rp_rfUploader.dropPrompt"),
          selectPrompt: t("i.rp_rfUploader.selectPrompt"),
          uploaded: t("i.rp_rfUploader.uploadedText"),
          merging: t("i.rp_rfUploader.merging"),
          downloading: t("i.rp_rfUploader.downloading")
        };
      }
    }
  },
  model: {
    prop: "uploadedFiles",
    event: "change"
  },
  // computed: {},
  created() {
    this.uploadedChunks = {};
    let _uploaded = this.options.uploaded || [];
    const fileCount = _uploaded.length;
    if (fileCount) {
      this.loadingUploaded = true;
      let fileInfoArr = [];
      _uploaded.forEach((file, index) => {
        window.$http
          .post(URL + "/getFileInfo", {
            fileId: file.fileId,
            path: file.path
          })
          .then(res => {
            fileInfoArr = fileInfoArr.concat(res.data);
            if (index + 1 === fileCount) {
              this.loadingUploaded = false;
              this.setUploadInfo(fileInfoArr);
            }
          })
          .catch(e => {
            if (index + 1 === fileCount) {
              this.loadingUploaded = false;
            }
          });
      });
    } else {
      this.uploaded = this.uploadedFiles;
    }
  },
  // mounted() {},
  methods: {
    async preprocess(chunk) {
      await window.$http.refreshToken();
      chunk.preprocessFinished();
    },
    processParams(params) {
      const { chunkNumber, identifier, totalChunks } = params;
      let _uploadedChunks = this.uploadedChunks;
      _uploadedChunks[identifier] = _uploadedChunks[identifier] || new Array(totalChunks);
      params.correlationId = `${chunkNumber - 1}##${params.identifier}`;
      return params;
    },
    processResponse(res, cb) {
      const { correlationId, partId } = JSON.parse(res);
      let _uploadedChunks = this.uploadedChunks;
      const [chunkId, identifier] = correlationId.split("##");
      _uploadedChunks[identifier][chunkId] = partId;
      cb(null, res);
    },
    fileAdded() {
      this.reading = true;
    },
    filesSubmitted() {
      this.reading = false;
    },
    setUploadInfo(newValue) {
      newValue && (this.uploaded = newValue);
      this.$emit("change", this.uploaded);
    },
    download(file) {
      if (file.status === "uploaded") {
        file.status = "downloading";
        window.$http
          .post(
            URL + "/download",
            {
              fileId: file.fileId,
              path: file.path
            },
            null,
            { responseType: "blob", timeout: 0 }
          )
          .then(res => {
            const hrefValue = window.URL.createObjectURL(res.data);
            const fileInfo = res.headers["content-disposition"].split(";")[1];
            const a = document.createElement("a");
            a.setAttribute("href", hrefValue);
            a.download = decodeURIComponent(fileInfo && fileInfo.split("=")["1"]);
            a.style.display = "none";
            document.body.append(a);
            a.click();
            a.remove();
            file.status = "uploaded";
          });
      } else {
        this.$message.success({
          content: Locale.methods.t("i.rp_rfUploader." + file.status),
          duration: 3
        });
      }
    },
    deleteFile(file) {
      if (file.status === "uploaded") {
        window.$http
          .post(URL + "/delete", {
            fileId: file.fileId,
            path: file.path
          })
          .then(() => {
            this.setUploadInfo(this.uploaded.filter(item => item.fileId !== file.fileId));
          });
      } else {
        this.$message.success({
          content: Locale.methods.t("i.rp_rfUploader." + file.status),
          duration: 3
        });
      }
    },
    fileSuccess(rootFile, file) {
      let { attributes, path } = this.options;
      let _uid = file.uniqueIdentifier;
      let partIds = this.uploadedChunks[_uid] || [];
      delete this.uploadedChunks[_uid];
      let _fileInfo = {
        id: file.id,
        fileId: "",
        fileName: file.name,
        identifier: _uid,
        uniqueIdentifier: _uid,
        attributes,
        path,
        status: "merging" // merging downloading uploaded
      };

      this.uploaded.push(_fileInfo);
      this.setUploadInfo();
      window.$http
        .post(
          URL + "/mergeParts",
          {
            attributes,
            fileName: file.name,
            partIds,
            path
          },
          null,
          {
            timeout: 0,
            transformResponse: [_ => _] //不用默认的数据处理方式
          }
        )
        .then(res => {
          if (res.status === 200) {
            _fileInfo.status = "uploaded";
            _fileInfo.fileId = res.data;
          }
        });
    },
    fileCategory(file) {
      let extension = file.extension || file.fileType || "file";
      extension = extension.split("/").pop();
      const isFolder = file.isFolder;
      let type = isFolder ? "folder" : "unknown";
      const typeMap = {
        image: ["gif", "jpg", "jpeg", "png", "bmp", "webp"],
        video: ["mp4", "m3u8", "rmvb", "avi", "swf", "3gp", "mkv", "flv"],
        audio: ["mp3", "wav", "wma", "ogg", "aac", "flac"],
        document: [
          "doc",
          "txt",
          "docx",
          "pages",
          "epub",
          "pdf",
          "numbers",
          "csv",
          "xls",
          "xlsx",
          "keynote",
          "ppt",
          "pptx"
        ]
      };
      Object.keys(typeMap).forEach(_type => {
        const extensions = typeMap[_type];
        if (extensions.indexOf(extension) > -1) {
          type = _type;
        }
      });
      return type;
    }
  }
};
</script>
<style lang="less">
.uploader {
  .uploader-file {
    position: relative;
    height: 49px;
    line-height: 49px;
    overflow: hidden;
    border-bottom: 1px solid #cdcdcd;
    .uploader-file-info {
      position: relative;
      z-index: 1;
      height: 100%;
      overflow: hidden;
      &:hover {
        background-color: rgba(240, 240, 240, 0.2);
      }

      i,
      em {
        font-style: normal;
      }
    }

    .uploader-file-icon {
      width: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: top;
      margin-top: 13px;
      margin-right: 8px;

      &:before {
        content: "📃";
        display: block;
        height: 100%;
        font-size: 24px;
        line-height: 1;
        text-indent: 0;
      }
      &[icon="folder"]::before {
        content: "📂";
      }
      &[icon="image"]::before {
        content: "📊";
      }
      &[icon="video"]::before {
        content: "📹";
      }
      &[icon="audio"]::before {
        content: "🎵";
      }
      &[icon="document"]::before {
        content: "📋";
      }
    }

    .uploader-file-progress {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #e2eeff;
      transform: translateX(-100%);
    }

    .uploader-file-name,
    .uploader-file-size,
    .uploader-file-meta,
    .uploader-file-status,
    .uploader-file-actions {
      float: left;
      position: relative;
      height: 100%;
    }
    .uploader-file-name {
      width: 45%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-indent: 14px;
    }
    .uploader-file-size {
      width: 13%;
      text-indent: 10px;
    }
    .uploader-file-meta {
      width: 8%;
    }
    .uploader-file-status {
      width: 24%;
      text-indent: 20px;
    }
  }

  .uploader-list {
    .uploader-file[status="success"] {
      display: none;
    }
  }

  .loading-file-info {
    text-align: center;
    font-size: 20px;
    background-color: #d4d9dc;
    padding: 10px;
  }
}

.uploader-file-actions {
  width: 10%;
  & > span {
    float: left;
    width: 16px;
    height: 16px;
    margin-top: 16px;
    margin-right: 10px;
    cursor: pointer;
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABkCAYAAAD0ZHJ6AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxMAAAsTAQCanBgAAARkSURBVGje7ZnfS1NRHMAH4ptPkvQSuAdBkCxD8FUQJMEULUgzy1KyyPVQ4JMiiP4Bvg6EwUQQfMmwhwRDshwaKUjDVCgoSdDNHkzTJZ6+Z37Purve8+PeTb2TM/ggu+ew89l33x8H9BBCPG7GowXTJej3+wnDvEm0JuLC04+EYWftVAUv+fiCvDUdQR1BHUEdQR3BTIygvixoQS14XgTtthLVdpNWwXRLqvQ724LplFRtyrYF0yVpFLQrKRVMh6RZ0I6kkmCqklaCqpKZH0FX56Crq9jVfdDVk0RfFrSgFsxkQVmLcdKCVrKySCrryhPEyYShhzOcrFtG0EoilfHHk1CRU5rF6ZjNZhlVOW6RnMSVyyilKies4pO41diVy8wIujoHXV3FGdMHXTtJKLFYTLhZtq4vC1rwXApCZTIqgR6g1PBMCO9DL3bMMSqBHqDU8EyISDAHiGKvWwcCQG2KgjlAFCDAOhAAap0K5gKLphk8mqJgLrCIgoxRJ4J5wKpJ7gAoMkn5EBXBPGDVJHcAFJmkfIhQcAql1oBpTvTol9gG9pm4RHAKpdaAaU706JfYBvaZuJVgPQrt4sFlnOh5MC/p3lmJYD0K7eLBZZzoeTAv6d5ZnuAYHjpgEOnk5F0ufhG6v1ggOIaHDhhEOjl5l4tfhO4vthLcwAMrFNvLJO5vEwhu4IEViu1lEve3WQmyoihQFBzG/V0CQVYUBYqCw7i/SxTBcpsRbFeIYLnNCLZbCY5b5KAnxRwct8hBj9McZFVMW0ihRNBuFdMWUigRlFaxuQ9WWYjRMTiIe5z0wSoLMToGB3GPsA9aTZIJoB+nRgBnM1tzOkkmgH6cGgGczWzNpzqLx3n/aULJJgezeNw07oxQySbVywKjBOgFRnDs+VEsx8FlgVEC9AIjOPb8KJYjvSzoG7UW1IJaUAtqQS14toLNM5fN5APdwBJA8G83Pk/aK/rgzVvXzeQD3cASQPBvNz5P2ssTzAaGUIrHEO6zI5gNDKEUjyHcxxWkh4Ylcowwk1QQpIeGJXKMMJO0EgwqyjGCioJBJvDrxRMSuVOTJEXfbz1/bHwWtBL0yoQehK6RucgE+bGzanzulQh6E3IgQV+xpc8kcrfuSO7eTfJ3ZYmQw0Oy9azVKOk1C/bJ5D5F38YPeLfx0rjWJxHsS0SqsSYuxySjj5qO5Oj7xQWy2VBtFOwzCy6ryH3YfE3uh64Y1xckgstJPydEjkkeHv07Iy4Xaao15+KCWTBx6M/db+T9xivSErqaJDdzXI6yLRE8Vgg0coex/SPJvT0SbWu0KpZtbgSpCH3NRt7I5OxHkObc6heU+/M/J5vrpBFM5GBLqCQux14COXs5CNXK5OjPGm1tSMrJSOMNYQ4mVTGV/L6zTL7+DovkbFUxbSW0Wo05l8hJWsU+cRWfSh+Mt5Lb1ck/J1TvVsdDaR/MiEni+llsdZuZp62EViu+96bpNjNPWwmtVnzvFd5m9IVVC54x/wA7gNvqFG9vXQAAAABJRU5ErkJggg==")
      no-repeat 0 0;
  }

  .uploader-file-remove {
    background-position-y: -34px;
    display: block;
  }
}
</style>

