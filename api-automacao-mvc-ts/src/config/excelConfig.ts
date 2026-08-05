// src/config/excelConfig.ts
import path from 'path';

const perfilUsuario = process.env.USERPROFILE || '';

// Constantes do Webhook / Dashboard do GLPI
export const CAMINHO_EXCELW = path.join(perfilUsuario, 'OneDrive - IMONITORE', 'Site', 'Automacao', 'WebhookGLPI.xlsx');

// Constantes da Automação de E-mails / SharePoint
export const CAMINHO_EXCEL = path.join(perfilUsuario, 'OneDrive - IMONITORE', 'Site', 'Automacao', 'Email.xlsx');

// Nome da tabela padrão compartilhada pelos fluxos do Power Automate
export const NOME_TABELA = 'Tabela1';
