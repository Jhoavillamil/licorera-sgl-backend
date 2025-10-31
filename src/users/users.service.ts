import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user/user.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  isActive?: boolean;
  roleIds?: string[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Usuario o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updates = { ...updateUserDto };

    if (updates.password) {
      // Generar un nuevo hash para la contraseña
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Aplicar las actualizaciones al usuario
    Object.assign(user, updates);

    return this.userRepository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }
}