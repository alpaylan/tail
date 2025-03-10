/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['cvdl-ts'],
  webpack(config) {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // maps fs to a virtual one allowing to register file content dynamically
        fs: __dirname + '/src/virtual-fs.js',
        // iconv-lite is used to load cid less fonts (not spec compliant)
        'iconv-lite': false
      },
      fallback: {
        ...config.resolve.fallback,
        // crypto module is not necessary at browser
        crypto: false,
        // fallbacks for native node libraries
        buffer: require.resolve('buffer/'),
        stream: require.resolve('readable-stream'),
        zlib: require.resolve('browserify-zlib'),
        util: require.resolve('util/'),
        assert: require.resolve('assert/')
      }
    },
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        // bundle and load afm files verbatim
        { test: /\.afm$/, type: 'asset/source' },
        // bundle and load binary files inside static-assets folder as base64
        {
          test: /src[/\\]static-assets/,
          type: 'asset/inline',
          generator: {
            dataUrl: content => {
              return content.toString('base64');
            }
          }
        },
        // load binary files inside lazy-assets folder as an URL
        {
          test: /src[/\\]lazy-assets/,
          type: 'asset/resource'
        },
        // convert to base64 and include inline file system binary files used by fontkit and linebreak
        {
          enforce: 'post',
          test: /fontkit[/\\]index.js$/,
          loader: 'transform-loader',
          options: {
            brfs: {}
          }
        },
        {
          enforce: 'post',
          test: /linebreak[/\\]src[/\\]linebreaker.js/,
          loader: 'transform-loader',
          options: {
            brfs: {}
          }
        }
      ]
    }
    // config.resolve.fallback = {
    //   ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
    //   // by next.js will be dropped. Doesn't make much sense, but how it is
    //   fs: false, // the solution
    //   crypto: false,
    //   buffer: require.resolve('buffer/'),
    //   util: require.resolve('util/'),
    //   stream: require.resolve('stream-browserify'),
    //   zlib: require.resolve('browserify-zlib'),
    //   assert: require.resolve('assert/'),
      
    // };
    

    return config;
  },
}


module.exports = nextConfig
