new Vue({
  el: '#app',
  data () {
    return {
      list: {
        title: 'Recently added',
        app: [
          {
            image:
              'https://store-images.s-microsoft.com/image/apps.49027.13510798887047136.8a1815b2-017c-48c8-80cc-ca4d1ae5c8cf.9bfbc0bd-b16f-4312-bfcb-bf3a709aed68?mode=scale&q=90&h=200&w=200&background=%230078D4',
            title: 'Paint 3D'
          },
          {
            image:
              'https://store-images.s-microsoft.com/image/apps.16911.9007199266246188.daddddbb-1e22-4bcc-aad6-e32209ccff02.d57e2874-412d-4791-9243-01095dbdba8c?mode=scale&q=90&h=200&w=200&background=%230078D4',
            title: 'Groove Music'
          },
          {
            image:
              'https://store-images.s-microsoft.com/image/apps.28355.9007199266248608.6a399a57-b260-4ce9-b265-c47558f755e1.b4124129-26e8-401d-9989-f8689f69fa3a?mode=scale&q=90&h=300&w=300',
            title: 'Mail'
          }
        ]
      }
    }
  },
  methods: {
    logoutHandle () {
      db.get('token')
        .remove()
        .write()
      remote.getCurrentWindow().close()
    }
  }
})
