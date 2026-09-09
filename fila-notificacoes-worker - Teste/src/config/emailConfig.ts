// configEmail.ts
export const configEmail = {
  smtp: {
    host: "smtp.ethereal.email",       // Host oficial do Ethereal
    port: 587,                         // Porta padrão
    secure: false,                     // false para a porta 587
    
    // ⚠️ SUBSTITUA estes dois campos pelos valores gerados no site:
    user: "arvel.glover28@ethereal.email",   // Ex: giovanni.kris63@ethereal.email
    pass: "QUgX8ZTMRa5QxHFfDA"    // Ex: uY7GfDxE2H8JkW
  },
  remetente: {
    nome: "TollManagement Segurança",
    endereco: "seguranca@tollmanagement.local" // Pode inventar o e-mail que quiser para testes
  }
};
