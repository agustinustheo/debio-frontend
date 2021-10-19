<template>
  <Dialog :show="show">
    <template v-slot:title>
      IPFS to GCS Simulation
    </template>
    <template v-slot:body>
        <v-form ref="testForm">
            <v-file-input
                dense
                label="Upload to IPFS"
                prepend-icon="mdi-file"
                outlined
                accept="text/vcard"
                @change="fileUploadEventListener"
                show-size
            ></v-file-input>
        </v-form>
    </template>
    <template v-slot:actions>
      <Button @click="downloadFile" color="primary" dark>
        Synchronize with GCS
      </Button>
    </template>
  </Dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Dialog from '@/components/Dialog'
import Button from '@/components/Button'
import { upload, encrypt, syncDecryptedFromIPFS } from "@/lib/ipfs"
import serviceHandler from "@/lib/metamask/mixins/serviceHandler"

export default {
  name: 'TestUploadSyncDialog',

  components: {
    Dialog,
    Button,
  },
  
  mixins: [serviceHandler],

  mounted(){
    this.show = true
  },

  data: () => ({
    show: false,
    ipfsUrl: "",
    isLoading: false,
    identity: null,
  }),

  computed: {
    ...mapGetters({
      api: 'substrate/getAPI',
      pair: 'substrate/wallet',
    }),

    ...mapState({
      mnemonic: state => state.substrate.mnemonicData
    }),
  },

  methods: {
    fileUploadEventListener(file) {
      this.ipfsUrl = ""
      if (!this.$refs.testForm.validate()) {
        return
      }
      if (file && file.name) {
        if (file.name.lastIndexOf(".") <= 0) {
          return
        }
        this.isUploading = true
        this.isLoading = true

        const fr = new FileReader()
        fr.readAsText(file)

        const context = this
        fr.addEventListener("load", async () => {
          const pair = {
            secretKey: Uint8Array.from(
                Object.values(context.mnemonic.privateKey)
            ),
            publicKey: Uint8Array.from(
                Object.values(context.mnemonic.publicKey)
            ),
          }

          // Encrypt
          const encrypted = await encrypt({
            text: fr.result,
            fileType: 'text/vCard',
            fileName: file.name,
            pair,
          })

          const { chunks, fileName: encFileName, fileType: encFileType } = encrypted

          // Upload
          const uploaded = await upload({
            fileChunk: JSON.stringify(chunks),
            fileType: encFileType,
            fileName: encFileName,
          })

          context.ipfsUrl = `https://ipfs.io/ipfs/${uploaded.ipfsPath[0].data.path}` // this is a file that can be sent to server...
          context.isLoading = false

          alert(`Upload to IPFS finished: https://ipfs.io/ipfs/${uploaded.ipfsPath[0].data.path}`)
        })
      }
    },

    async downloadFile() {
        const pair = {
            secretKey: Uint8Array.from(
                Object.values(this.mnemonic.privateKey)
            ),
            publicKey: Uint8Array.from(
                Object.values(this.mnemonic.publicKey)
            ),
        }
        const baseUrl = "https://ipfs.io/ipfs/"
        const path = this.ipfsUrl.replace(baseUrl, "")
        await this.dispatch(
            syncDecryptedFromIPFS,
            path,
            pair,
            "file.vcf",
            "text/vCard"
        )
    },

  }
}
</script>

<style>

</style>