import { SeederService } from '../src/seeder/seeder.service';

module.exports = async () => {
  const seederService = globalThis.APP.get(SeederService);
  await seederService.truncateTables();
  await globalThis.APP.close();
};
