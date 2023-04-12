<template>
  <div class="full">
    <div id="screen" class="full" style="width: 100vw; height: 100vh"></div>
  </div>
</template>

<script>
import RFB from '@novnc/novnc/core/rfb';
export default {
  name: 'WindowsGud',
  data() {
    return {
      url: '',
      rfb: null
    }
  },
  methods: {
    getUrl(host = '172.18.56.146:5900') {
      let protocol = '';
      if (window.location.protocol === 'https:') {
        protocol = 'wss://';
      } else {
        protocol = 'ws://';
      }
      // 加window.location.host可以走vue.config.js的代理，ws://localhost:8081/vnc/192.168.18.57:5900
      const wsUrl = `${protocol}${window.location.host}/vnc/${host}`;
      return wsUrl;
    },
    // vnc连接断开的回调函数
    disconnectedFromServer(msg) {
      console.log('断开连接', msg);
      // clean是boolean指示终止是否干净。在发生意外终止或错误时 clean将设置为 false。
      if (msg.detail.clean) {
        // 根据 断开信息的msg.detail.clean 来判断是否可以重新连接
      } else {
        // 这里做不可重新连接的一些操作
        console.log('连接不可用（可能需要密码）')
        this.rfb = null;
      }
      this.rfb = null;
      // this.connectVnc();
    },
    // 连接成功的回调函数
    connectedToServer() {
      this.$emit('success', true)
    },
    /**
     * @abstract  连接vnc的函数
     */
    connectVnc() {
      const PASSWORD = '111111';
      let rfb = new RFB(document.getElementById('screen'), this.url, {
        // 向vnc 传递的一些参数，比如说虚拟机的开机密码等  
        credentials: { username: 'administrator', password: PASSWORD, }
      });
      rfb.addEventListener('connect', this.connectedToServer);
      rfb.addEventListener('disconnect', this.disconnectedFromServer);
      // scaleViewport指示是否应在本地扩展远程会话以使其适合其容器。禁用时，如果远程会话小于其容器，则它将居中，或者根据clipViewport它是否更大来处理。默认情况下禁用。
      rfb.scaleViewport = true;
      // 是一个boolean指示是否每当容器改变尺寸应被发送到调整远程会话的请求。默认情况下禁用
      rfb.resizeSession = true;
      this.rfb = rfb;
    }
  },
  mounted() {
    this.url = this.getUrl();
    this.connectVnc();
  },
  beforeDestroy() {
    this.rfb && this.rfb.disconnect();
  }
}
</script>