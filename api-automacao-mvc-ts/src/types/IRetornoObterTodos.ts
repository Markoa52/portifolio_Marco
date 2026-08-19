
import ExcelJS from 'exceljs';
// Interface que define o retorno estruturado do método de leitura
export interface IRetornoObterTodos {
  workbook: ExcelJS.Workbook;
  worksheet: ExcelJS.Worksheet;
  linhas: any[][];
}