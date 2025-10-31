import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class InitialMigration1732912800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión UUID si no existe
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Crear tabla roles
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_ROLES_NAME',
        columnNames: ['name'],
      }),
    );

    // Crear tabla users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_USERNAME',
        columnNames: ['username'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
      }),
    );

    // Crear tabla user_roles (Many-to-Many)
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'role_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Crear tabla suppliers
    await queryRunner.createTable(
      new Table({
        name: 'suppliers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'contact',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear tabla regla_negocio_parametro
    await queryRunner.createTable(
      new Table({
        name: 'regla_negocio_parametro',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nombreParametro',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'valorNumerico',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'valorTexto',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índice solo si no existe
    const indexExists = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'IDX_RULE_PARAMS_NOMBRE'
      );
    `)) as Array<{ exists: boolean }>;

    if (!indexExists[0]?.exists) {
      await queryRunner.createIndex(
        'regla_negocio_parametro',
        new TableIndex({
          name: 'IDX_RULE_PARAMS_NOMBRE',
          columnNames: ['nombreParametro'],
        }),
      );
    }

    // Crear tabla productos
    await queryRunner.createTable(
      new Table({
        name: 'productos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'precioAdquisicion',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'precioVenta',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'stock',
            type: 'integer',
            default: 0,
          },
          {
            name: 'stockMinimo',
            type: 'integer',
            default: 0,
          },
          {
            name: 'unidadMedida',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear tabla clientes
    await queryRunner.createTable(
      new Table({
        name: 'clientes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'telefono',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'direccion',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'observaciones',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear tabla pedidos
    await queryRunner.createTable(
      new Table({
        name: 'pedidos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'clienteId',
            type: 'uuid',
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '50',
            default: "'Abierto'",
          },
          {
            name: 'fechaHoraInicio',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'fechaHoraFin',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'observaciones',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pedidos',
      new TableForeignKey({
        columnNames: ['clienteId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clientes',
        onDelete: 'CASCADE',
      }),
    );

    // Crear tabla pedido_productos
    await queryRunner.createTable(
      new Table({
        name: 'pedido_productos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'pedidoId',
            type: 'uuid',
          },
          {
            name: 'productoId',
            type: 'uuid',
          },
          {
            name: 'cantidad',
            type: 'integer',
          },
          {
            name: 'precioUnitario',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pedido_productos',
      new TableForeignKey({
        columnNames: ['pedidoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pedidos',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pedido_productos',
      new TableForeignKey({
        columnNames: ['productoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'productos',
        onDelete: 'CASCADE',
      }),
    );

    // Crear tabla movimiento_inventario
    await queryRunner.createTable(
      new Table({
        name: 'movimiento_inventario',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'productoId',
            type: 'uuid',
          },
          {
            name: 'tipo',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'cantidad',
            type: 'integer',
          },
          {
            name: 'proveedorId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'vendedorId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'observaciones',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'movimiento_inventario',
      new TableForeignKey({
        columnNames: ['productoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'productos',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'movimiento_inventario',
      new TableForeignKey({
        columnNames: ['proveedorId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'suppliers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'movimiento_inventario',
      new TableForeignKey({
        columnNames: ['vendedorId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas en orden inverso (respetando foreign keys)
    await queryRunner.dropTable('movimiento_inventario', true);
    await queryRunner.dropTable('pedido_productos', true);
    await queryRunner.dropTable('pedidos', true);
    await queryRunner.dropTable('clientes', true);
    await queryRunner.dropTable('productos', true);
    await queryRunner.dropTable('regla_negocio_parametro', true);
    await queryRunner.dropTable('suppliers', true);
    await queryRunner.dropTable('user_roles', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('roles', true);
  }
}
