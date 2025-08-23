import { packageConfig } from '../../configs/tsup.config.js';

export default {
  ...packageConfig,
  tsconfig: './tsconfig.build.json'
};