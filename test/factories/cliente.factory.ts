import { DataSource } from 'typeorm';
import { Cliente } from '../../src/entities/cliente/cliente.entity';

export interface CreateTestClienteOptions {
  nombreUsuario?: string;
  tipoID?: string;
  numeroID?: string;
  genero?: string;
  observaciones?: string;
}

export const createTestCliente = async (
  dataSource: DataSource,
  options: CreateTestClienteOptions = {}
): Promise<Cliente> => {
  const clienteRepository = dataSource.getRepository(Cliente);
  
  const cliente = clienteRepository.create({
    nombreUsuario: options.nombreUsuario || 'Test Cliente',
    tipoID: options.tipoID || 'CC',
    numeroID: options.numeroID || '123456789',
    genero: options.genero || 'No Especificado',
    observaciones: options.observaciones || 'Cliente de prueba'
  });

  return await clienteRepository.save(cliente);
};