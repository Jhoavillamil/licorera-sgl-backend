import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user/user.entity';
import { Role } from '../../entities/role/role';
import { RuleParam } from '../../entities/rule-param/rule-param.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RuleParam)
    private readonly ruleParamRepository: Repository<RuleParam>,
  ) {}

  async seedRoles(): Promise<void> {
    const roles = [
      {
        name: 'Admin',
        description: 'Administrador del sistema con acceso completo',
      },
      {
        name: 'Vendedor',
        description: 'Vendedor con acceso a operaciones de venta',
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`✅ Rol ${roleData.name} creado`);
      } else {
        console.log(`⏭️  Rol ${roleData.name} ya existe`);
      }
    }
  }

  async seedAdminUser(): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'Admin' },
    });

    if (!adminRole) {
      throw new Error(
        'El rol Admin debe existir antes de crear el usuario admin',
      );
    }

    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = this.userRepository.create({
        username: 'admin',
        email: 'admin@sgl.com',
        password: hashedPassword,
        isActive: true,
        roles: [adminRole],
      });

      await this.userRepository.save(adminUser);
      console.log(
        '✅ Usuario admin creado (username: admin, password: admin123)',
      );
    } else {
      console.log('⏭️  Usuario admin ya existe');
    }
  }

  async seedRuleParams(): Promise<void> {
    const ruleParams = [
      {
        nombreParametro: 'DIAS_SIN_VENTA_BAJA_ROTACION',
        valorNumerico: 90,
        descripcion:
          'Días sin venta para considerar un producto de baja rotación (A-01)',
      },
      {
        nombreParametro: 'LIMITE_RATIO_STOCK_VENTA',
        valorNumerico: 10,
        descripcion:
          'Límite de ratio Stock/Venta para considerar rotación lenta (A-02)',
      },
      {
        nombreParametro: 'PORCENTAJE_VARIACION_COSTO',
        valorNumerico: 10,
        descripcion:
          'Porcentaje de variación de costo para análisis de dispersión (A-06)',
      },
      {
        nombreParametro: 'NUMERO_CLIENTES_VIP',
        valorNumerico: 10,
        descripcion: 'Número de clientes VIP a mostrar en el top (A-08)',
      },
      {
        nombreParametro: 'DIAS_INACTIVIDAD_FUGA',
        valorNumerico: 60,
        descripcion:
          'Días de inactividad para considerar un cliente en riesgo de fuga (A-09)',
      },
      {
        nombreParametro: 'MINIMO_COOCURRENCIA_CANASTA',
        valorNumerico: 20,
        descripcion:
          'Mínimo porcentaje de co-ocurrencia para canasta de compra común (A-10)',
      },
    ];

    for (const paramData of ruleParams) {
      const existingParam = await this.ruleParamRepository.findOne({
        where: { nombreParametro: paramData.nombreParametro },
      });

      if (!existingParam) {
        const param = this.ruleParamRepository.create(paramData);
        await this.ruleParamRepository.save(param);
        console.log(`✅ Parámetro ${paramData.nombreParametro} creado`);
      } else {
        console.log(`⏭️  Parámetro ${paramData.nombreParametro} ya existe`);
      }
    }
  }

  async seedAll(): Promise<void> {
    console.log('🌱 Iniciando seeders...');

    await this.seedRoles();
    await this.seedAdminUser();
    await this.seedRuleParams();

    console.log('✅ Seeders completados');
  }
}
