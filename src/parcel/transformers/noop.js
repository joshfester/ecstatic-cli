import { Transformer } from '@parcel/plugin';

export default new Transformer({
  async transform({ asset }) {
    // Do nothing - just return the asset unchanged
    return [asset];
  }
});