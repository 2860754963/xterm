<template>
	<div id="podTerminal">
		<div id="terminal" ref="terminal" />
	</div>
</template>

<script>
	import {
		Terminal
	} from 'xterm'
	import * as fit from 'xterm/lib/addons/fit/fit'
	import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
	import * as search from 'xterm/lib/addons/search/search'
	import 'xterm/dist/xterm.css'
	Terminal.applyAddon(fit)
	Terminal.applyAddon(webLinks)
	Terminal.applyAddon(search)

	export default {
		name: 'Terminal',
		data() {
			return {
				term: null,
				socket: null,
				containerName: '',
				loading: true,
			}
		},
		computed: {
			podName() {
				return this.tname
			},
			type() {
				return this.$route.query.type
			}
		},
		mounted() {
			// getWebShellToken({
			// 	namespace: this.namespace,
			// 	pod: this.pod
			// }).then(res => {
			// 	if (res.success) {
			// 		this.token = res.data
			// 		this.init()
			// 	}
			// })
			this.init()
		},
		beforeDestroy() {
			this.closeTerminalAndSocket()
		},
		methods: {
			init() {
				// this.createTerminal()
				// this.connect()
				// const { containerName } = this.$route.params
				try {
					// this.getPodInfo()
					// this.containerName = containerName || this.pod.spec.containers[0].name
					this.createTerminal()
					this.connect()
				} catch (e) {
					if (e.response && e.response.data) {
						this.$message.error(e.response.data.message)
					}
				}
			},
			connect() {
				// this.bocCluster = JSON.parse(localStorage.bocCluster)
				// let reIp = this.bocCluster.remoteApiAddr || this.bocCluster.serviceIp
				// if (this.bocCluster.serviceIpv4) {
				//   reIp = this.bocCluster.serviceIpv4
				// }
				// const url = reIp + ':30019';
				// const { protocol, host } = window.location

				const webSocketUrl = process.env.VUE_APP_API_SOCKET_URL
				const ws = new WebSocket(webSocketUrl)
				ws.onopen = evt => this.onConnectionoperateen(evt)
				ws.onmessage = evt => this.onConnectionMessage(evt)
				ws.onclose = evt => {
					// 切换容器时，旧的socket接到close事件时会向当前term写原因，加上判断可以避免这个bug
					if (this.socket !== ws) {
						return
					}
					this.onConnectionClose(evt)
				}
				this.socket = ws
			},

			onConnectionoperateen(data) {
				console.log(data,'123123')
				let datas = {
					host: "172.18.55.134",
					operate: "connect",
					password: "1234!@#$Sapics",
					port: "22",
					username: "root"
				}
				this.socket.send(JSON.stringify(datas))
				this.initTerminalResize()
				this.term.focus()
			},

			// 修改窗口大小
			initTerminalResize() {
				const terminalElement = this.$refs.terminal
				const width = terminalElement.parentElement.clientWidth
				const height = terminalElement.parentElement.clientHeight

				const {
					term
				} = this
				const actualCellWidth = terminalElement.offsetWidth / term.cols
				const actualCellHeight = terminalElement.offsetHeight / term.rows

				const cols = (width - term._core.viewport.scrollBarWidth - 15) / actualCellWidth
				const rows = height / actualCellHeight
				this.term.resize(parseInt(cols.toString(), 10), parseInt(rows.toString(), 10))
			},

			// 获取服务端传来的信息
			onConnectionMessage(evt) {
				try {
					const msg = evt.data
					if (evt.returnValue) {
						this.term.write(msg)
					}
				} catch (e) {
					// console.log(e)
				}
			},

			onConnectionClose(evt) {
				if (evt.reason !== '' && evt.code !== 1000) {
					this.term.writeln(evt.reason)
				} else {
					this.term.writeln('Connection closed')
				}
			},

			createTerminal() {
				const term = new Terminal({
					cursorBlink: true
				})
				term.open(this.$refs.terminal)
				term.fit()
				term.focus()
				term.onResize(event => {
					this.socket.send(JSON.stringify({
						operate: 'resize',
						Cols: event.cols,
						Rows: event.rows
					}))
					this.socket.send(JSON.stringify({
						operate: 'resize',
						Cols: event.cols,
						Rows: event.rows
					}))
				})
				term.onData(data => {
					console.log(JSON.stringify(data))
					this.socket.send(JSON.stringify({
						operate: 'command',
						command: data
					}))
				})
				this.term = term
				this.$emit('success',true)
				this.loading = false
			},

			closeTerminalAndSocket() {
				if (this.term) {
					this.term.dispose()
				}

				if (this.socket) {
					this.socket.close()
				}
			}
		}
	}
</script>

<style lang="scss">
	#podTerminal {
		height: 100%;
		display: flex;
		flex-direction: column;
		// position: fixed;
		// left: 0;
		// right: 0;
		// top: 0;
		// bottom: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0.7);
		z-index: 101;

		.header {
			display: flex;
			justify-content: space-between;
			background-color: #1d2143 !important;
			color: #fafafa;
			white-space: nowrap;
		}

		.xterm .xterm-viewport {
			overflow: hidden;
		}

		.header .branding,
		header .branding {
			display: flex;
			align-items: center;
			flex: 0 0 auto;
			padding: 0 1rem;
		}

		.header .branding,
		.header .header-actions {
			height: 3.5rem;
		}

		.header .header-actions,
		header .header-actions {
			flex: 0 0 auto;
			display: inline-flex;
			justify-content: flex-end;
			align-items: center;
			padding-right: 1rem;
		}

		.header .header-actions .el-dropdown-link {
			color: #fafafa;
			font-size: 1.2rem;
		}

		#terminal {
			height: 100%;
		}
	}
</style>
