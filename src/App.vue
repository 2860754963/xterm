<template>
	<div id="app">
		<!-- <div> <Terminal @success="success()"/></div>
   <div> <WindowsGud @success="success()"/></div> -->
		<div>
			<button @click="switchs('Terminal')">Linux</button>
			<button @click="switchs('WindowsGud')">Windows</button>
			<component :is="comes"></component>
		</div>
	</div>
</template>

<script>
	import Terminal from './components/Terminal.vue'
	import WindowsGud from './components/WindowsGud.vue'

	export default {
		name: 'app',
		data() {
			return {
				comes: null
			}
		},
		methods: {
			switchs(e){
					this.comes={
						Terminal,
						WindowsGud
					}[e]
			},
			success(e) {

			}
		}
	}
</script>

<style>
	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
	}
</style>
