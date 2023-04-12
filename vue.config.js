module.exports = {
	devServer: {
		proxy: {
			'/vnc': {
				target: 'http://127.0.0.1:8112',
				ws: true,
				changeOrigin: true,
				pathRewrite: {
				  '^/vnc': '/'
				},
			}
		}
	}
}
