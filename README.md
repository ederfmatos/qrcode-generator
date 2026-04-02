# QR Code Generator

Gerador de QR Code simples e moderno, desenvolvido com HTML, CSS e JavaScript puro.

## Demo

Acesse o projeto online: [https://ederfmatos.github.io/qrcode-generator/](https://ederfmatos.github.io/qrcode-generator/)

## Funcionalidades

- **Geração de QR Code**: Digite qualquer conteúdo (URL, telefone, texto, email, etc.)
- **Tamanhos**: Pequeno (128x128), Médio (256x256), Grande (512x512)
- **Preview em tempo real**: QR Code é gerado automaticamente enquanto você digita
- **Detecção automática de tipo**: Identifica URLs, emails, telefones, contatos e redes WiFi
- **Customização de cores**: Escolha a cor do QR Code e do fundo
- **Download**: Baixe o QR Code como imagem PNG
- **Compartilhamento**: Compartilhe via Web Share API ou copie a imagem
- **Histórico local**: Salva os últimos 20 QR Codes gerados (localStorage)
- **Copiar conteúdo**: Copie o texto do QR Code para a área de transferência
- **Arrastar e soltar**: Arraste arquivos de texto para adicionar conteúdo
- **Modo escuro**: Toggle para alternar entre tema claro e escuro
- **Responsivo**: Funciona perfeitamente em desktop e mobile

## Como usar

1. Clone o repositório:
```bash
git clone https://github.com/ederfmatos/qrcode-generator.git
```

2. Abra o arquivo `index.html` no navegador

Ou simplesmente acesse: [https://ederfmatos.github.io/qrcode-generator/](https://ederfmatos.github.io/qrcode-generator/)

## Tecnologias

- HTML5
- CSS3 (com variáveis CSS e suporte a temas)
- JavaScript ES6+ (vanilla)
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) via CDN
- [Google Fonts](https://fonts.googleapis.com/) (Inter)

## Estrutura do projeto

```
qr-code-generator/
├── index.html      # Estrutura HTML
├── styles.css      # Estilos CSS
├── script.js      # Lógica JavaScript
└── README.md      # Este arquivo
```

## Detecção de tipos

O gerador detecta automaticamente os seguintes tipos de conteúdo:

| Tipo | Ícone | Exemplo |
|------|-------|---------|
| URL | 🔗 | `https://exemplo.com` |
| Email | 📧 | `email@exemplo.com` |
| Telefone | 📞 | `+55 11 99999-9999` |
| Contato | 👤 | Dados vCard |
| WiFi | 📶 | Configurações WiFi |
| Texto | 📝 | Qualquer outro texto |

## Recursos

### Teclado
- **Enter**: Gera o QR Code manualmente
- **Esc**: Limpa o campo de entrada

### Histórico
- Salvo automaticamente no localStorage
- Clique em um item para restaurar
- Botão para limpar todo o histórico

### Compartilhamento
- Web Share API (mobile)
- Fallback: copia imagem ou baixa PNG

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Licença

MIT License
