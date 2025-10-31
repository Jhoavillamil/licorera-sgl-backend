import { DataSource } from 'typeorm';

export class TestCleanup {
  static async clearTable(dataSource: DataSource, entity: string) {
    const repository = dataSource.getRepository(entity);
    await repository.clear();
  }

  static async resetDatabase(dataSource: DataSource) {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      await this.clearTable(dataSource, entity.name);
    }
  }

  static async cleanupAfterTest(dataSource: DataSource) {
    if (dataSource.isInitialized) {
      await this.resetDatabase(dataSource);
    }
  }
}