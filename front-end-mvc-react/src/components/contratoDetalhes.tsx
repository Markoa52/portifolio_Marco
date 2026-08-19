// import React, { useState, useEffect } from 'react';
// import type { IContratoProps } from '../types/IContratoProps';
// import type { IDetalhesContrato } from '../types/IDetalhesContrato';

// export const ContratoDetalhe: React.FC<IContratoProps> = ({ idContrato }) => {
//   const [dados, setDados] = useState<IDetalhesContrato | null>(null);
//   const [carregando, setCarregando] = useState<boolean>(true);
//   const [erro, setErro] = useState<string | null>(null);

//   // 2. Dispara a busca no banco assim que o componente aparece na tela usando o ID recebido
//   useEffect(() => {
//     async function buscarDetalhesDoContrato() {
//       if (!idContrato) return;

//       try {
//         setCarregando(true);
//         setErro(null);

//         // Faz o fetch para buscar os dados completos do contrato específico
//         const resposta = await fetch(`/api/contracId/${idContrato}`);

//         if (!resposta.ok) {
//           throw new Error(`Não foi possível carregar os dados do contrato ${idContrato}.`);
//         }

//         const resultado = await resposta.json();
//         console.log("DADOS VINDOS DA API:", JSON.stringify(resultado)); // 👈 ADICIONE ESTA LINHA TEMPORARIAMENTE
        
//         setDados(resultado[0]); 
//       } catch (err: any) {
//         console.error(err);
//         setErro(err.message || "Erro de conexão com o servidor.");
//       } finally {
//         setCarregando(false);
//       }
//     }

//     buscarDetalhesDoContrato();
//   }, [idContrato]); // Refaz a busca se o idContrato mudar

//   // 3. Estados de carregamento e erro na tela
//   if (carregando) {
//     return <div style={{ color: '#888', padding: '20px' }}>⏳ Carregando informações do contrato {idContrato}...</div>;
//   }

//   if (erro) {
//     return <div style={{ color: '#e63946', padding: '20px' }}>❌ Erro: {erro}</div>;
//   }

//   return (
//     <div style={{ padding: '10px', color: '#fff', width: '100%' }}>
//       <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>📄 Detalhes do Contrato</h1>
      
//       {dados ? (
//         <div 
//           style={{ 
//             backgroundColor: '#1e1e1e', 
//             padding: '20px', 
//             borderRadius: '8px',
//             border: '1px solid #333',
//             maxWidth: '600px'
//           }}
//         >

//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>ID do Contrato:</strong> {dados.Id}
//           </p>
//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Data de Inicio:</strong>{' '}
//             {dados.StartDate ? new Date(dados.StartDate).toLocaleDateString('pt-BR') : '-'}
//           </p>
//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Data de Encerramento:</strong>{' '}
//             {dados.EndDate ? new Date(dados.EndDate).toLocaleDateString('pt-BR') : '-'}
//           </p>
//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Modalidade do Contrato:</strong> {dados.ContractModalityTypeId || '-'}
//           </p>
//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Código de Cadastro:</strong> {dados.BillingCode || '-'}
//           </p>
//             <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Prazo de Pagamento:</strong> {dados.PaymentTerm || '-'}
//           </p>
//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Data de Assinatura:</strong> {dados.TagMonthlyFeeUnitValue || '-'}
//           </p>
//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Valor da Mensalidade da Tag:</strong> {dados.ContractBillingCuttingId || '-'}    
//           </p>
//           <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }} >Data de Registro:</strong>{' '}
//             {dados.RegistrationDate ? new Date(dados.RegistrationDate).toLocaleDateString('pt-BR') : '-'}
//           </p>
          
//           {/* <p style={{ margin: '10px 0' }}>
//             <strong style={{ color: '#888', textTransform: 'uppercase' }}>Status Atual:</strong>{' '}
//             <span style={{ 
//               backgroundColor: dados.Status === 'Ativo' ? '#1b4332' : '#4a151b', 
//               color: dados.Status === 'Ativo' ? '#52b788' : '#ff85a1',
//               padding: '4px 8px',
//               borderRadius: '4px',
//               fontSize: '12px'
//             }}>
//               {dados.Status || 'Desconhecido'}
//             </span>
//           </p> */}

//         </div>
//       ) : (
//         <p style={{ color: '#aaa' }}>Nenhum dado encontrado para este contrato.</p>
//       )}
//     </div>
//   );
// };
