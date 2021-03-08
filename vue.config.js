const path = require('path')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  // 将entry指向examples
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  // 为packages目录添加babel-loader处理
  chainWebpack: config => {
    config.module
      .rule('js')
      .include
      .add(resolve('packages'))
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        return options
      })
  },

  configureWebpack: config => {
    // config.extensions = ['.js', '.vue', '.json', '.less']
    Object.assign(config, {
      resolve: {
        extensions: [".vue", ".js", ".json", '.less'], //文件优先解析后缀名顺序
        alias: {
          '@': path.resolve(__dirname, './src'),
          'components': path.resolve(__dirname, './src/components'),
          'assets': path.resolve(__dirname, './src/assets'),
          'api': path.resolve(__dirname, './src/api'),
          // 'router': path.resolve(__dirname, './src/router'),
          'views': path.resolve(__dirname, './src/views'),
          // 'public': path.resolve(__dirname, 'public')
        },
        plugins: []
      },
    })
    if (process.env.NODE_ENV === 'production') {
      // 生产环境覆盖webpack配置
    } else {
      // 开发环境覆盖webpack配置
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        path.resolve(__dirname, './src/styles/*.less')
      ]
    }
  }
}