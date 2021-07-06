//@flow
const map: {[string]: () => mixed} = {
    BlobHash: () => import('./BlobHash'),
    BlobServiceGetData: () => import('./BlobServiceGetData')
}
export default map