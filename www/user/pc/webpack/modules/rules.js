const path = require( 'path' );

module.exports = options => {
  const resolve = ( src ) => {
    return path.resolve( __dirname, '../../', src || '' );
  };

  return [
    {
      test: /\.jade$/,
      loader: 'jade-loader',
      options: {
        pretty: true,
        self: true
      },
      exclude: /node_modules|bower_components/
    },
    {
      test: /\.styl$/,
      use: options.ExtractTextPlugin.extract( {
        fallback: 'vue-style-loader',
        use: [
          'css-loader',
          'stylus-loader'
        ]
      } ),
      exclude: /node_modules|bower_components/
    },
    {
      test: /\.css$/,
      use: options.ExtractTextPlugin.extract( {
        fallback: 'vue-style-loader',
        use: [
          'style-loader', 'css-loader'
        ]
      } ),
      exclude: /node_modules|bower_components/
    },
    {
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      options: {
        formatter: options.eslintFriendlyFormatter
      },
      include: [
        // resolve( 'src' )
      ]
    },
    {
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['es2015'],
            babelrc: process.env.NODE_ENV !== 'dev'
          }
        }
      ],
      exclude: /node_modules|bower_components/
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {
          stylus: options.ExtractTextPlugin.extract( {
            use: [
              {
                loader: 'css-loader',
                options: {
                  minimize: process.env.NODE_ENV === 'production'
                }
              },
              {
                loader: 'stylus-loader'
              }
            ],
            fallback: 'vue-style-loader',
            // todo: 重要！！！解决 CSS 中图片路径的问题
            // todo: https://github.com/vuejs/vue-loader/issues/481
            publicPath: process.env.NODE_ENV === 'production' ? process.env.publicPath : '../'
          } )
        }
      },
      exclude: /node_modules|bower_components/
    },
    {
      test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
      loader: 'file-loader',
      options: {
        name: '/fonts/[name].[ext]'
      },
      exclude: /node_modules|bower_components/
    },
    {
      test: /\.(png|gif|jpg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        name: process.env.NODE_ENV === 'dev' ? 'images/[name].[ext]' : 'images/[name].[hash:8].[ext]',
        limit: 10000
      },
      exclude: /node_modules|bower_components/
    }
  ];
};
