# 🎮 Jogo da Velha - IA Imbatível & Multiplayer Online

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white)

Um jogo da velha profissional com **dois modos de jogo**: enfrente uma **IA imbatível** usando o algoritmo **Minimax** ou desafie seus amigos no **modo multiplayer online** com chat em tempo real!

---

## 📸 Preview

```
┌──────────────────────────────────────────┐
│         JOGO DA VELHA                    │
│   [ IA IMBATÍVEL • ALGORITMO MINIMAX ]   │
├──────────────────────────────────────────┤
│  Você: 3  │  Empates: 1  │  IA/Online: 2│
├──────────────────────────────────────────┤
│        [🤖 Vs IA] [🌐 Online]            │
│        [Fácil] [Médio] [Impossível]      │
├──────────────────────────────────────────┤
│  ┌───┬───┬───┐                           │
│  │ X │   │ O │   Turno: VEZ DE MARIA    │
│  ├───┼───┼───┤                           │
│  │   │ X │   │                           │
│  ├───┼───┼───┤                           │
│  │ O │   │   │                           │
│  └───┴───┴───┘                           │
└──────────────────────────────────────────┘
```

---

## 🎯 Modos de Jogo

### 🤖 Modo Solo - Vs IA

Enfrente uma inteligência artificial com três níveis de dificuldade:

#### 🎮 **Nível Fácil**
- Perfeito para iniciantes
- IA faz jogadas aleatórias
- Ótimo para aprender o jogo

#### 🎯 **Nível Médio**
- Desafio moderado
- IA alterna entre estratégia e aleatoriedade
- 50% de chance de usar o algoritmo Minimax

#### 🔥 **Nível Impossível**
- Desafio máximo para experts
- IA usa 100% Minimax - impossível de vencer
- Melhor resultado possível: empate
- Demonstra o poder da inteligência artificial

**Como Jogar (Solo):**
1. Selecione **"🤖 Vs IA"**
2. Escolha a dificuldade
3. Você é sempre **X** (azul) e joga primeiro
4. IA é sempre **O** (rosa)
5. Clique nas casas para fazer sua jogada
6. Use **Desfazer/Refazer** para analisar suas jogadas

---

### 🌐 Modo Multiplayer Online

Jogue com amigos em tempo real de qualquer lugar do mundo!

#### ✨ Recursos do Multiplayer:

- **Matchmaking Automático**: Sistema inteligente encontra oponentes
- **Chat em Tempo Real**: Converse durante a partida
- **Sincronização Perfeita**: Jogadas aparecem instantaneamente
- **Sistema de Turnos**: Impossível trapacear - validação server-side
- **Notificações**: Avisos quando oponente sai ou desconecta
- **Nomes Personalizados**: Veja quem está jogando

**Como Jogar (Online):**

1. **Certifique-se que o servidor está rodando:**
   ```bash
   npm start
   ```

2. **Acesse o jogo:**
   ```
   http://localhost:3000
   ```

3. **Entre no modo online:**
   - Clique em **"🌐 Multiplayer Online"**
   - Digite seu nome (ex: "Maria")
   - Clique em **"🔍 Buscar Partida"**

4. **Aguarde o match:**
   - O sistema procura automaticamente um oponente
   - Quando encontrar, a partida começa!
   - O primeiro jogador é **X** (azul)
   - O segundo jogador é **O** (rosa)

5. **Durante a partida:**
   - Indicador mostra: **"VEZ DE MARIA"** ou **"VEZ DE JOÃO"**
   - Só pode jogar no seu turno
   - Use o chat para conversar
   - Veja jogadas do oponente em tempo real

6. **Após o jogo:**
   - Modal mostra quem venceu (com o nome)
   - Clique em **"Jogar Novamente"** para nova partida
   - Ou clique em **"🚪 Sair da Partida"** para voltar ao menu

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** versão 14 ou superior
- **npm** (vem com Node.js)

Verifique se tem instalado:
```bash
node --version  # Deve mostrar v14.0.0 ou superior
npm --version   # Deve mostrar 6.0.0 ou superior
```

### Estrutura de Pastas

Organize seus arquivos assim:

```
jogo-da-velha/
│
├── server.js              # Servidor Node.js (multiplayer)
├── package.json           # Dependências
├── .gitignore            # Arquivos a ignorar no Git
│
└── public/                # Arquivos do cliente
    ├── index.html         # Interface do jogo
    ├── style.css          # Estilos visuais
    ├── script.js          # Lógica do jogo
    └── multiplayer.js     # Gerenciamento WebSocket
```

### Passo a Passo

#### 1️⃣ Clone ou baixe o projeto

```bash
git clone https://github.com/seu-usuario/jogo-da-velha.git
cd jogo-da-velha
```

#### 2️⃣ Crie a pasta `public`

```bash
mkdir public
```

#### 3️⃣ Mova os arquivos HTML/CSS/JS para `public`

**Windows (CMD):**
```cmd
move index.html public\
move style.css public\
move script.js public\
move multiplayer.js public\
```

**Linux/Mac (Terminal):**
```bash
mv index.html public/
mv style.css public/
mv script.js public/
mv multiplayer.js public/
```

#### 4️⃣ Instale as dependências

```bash
npm install
```

Isso instalará:
- `express` - Servidor web
- `socket.io` - WebSocket para multiplayer

#### 5️⃣ Inicie o servidor

**Modo Desenvolvimento** (recarrega automaticamente):
```bash
npm run dev
```

**Modo Produção:**
```bash
npm start
```

Você verá:
```
╔═══════════════════════════════════════╗
║  🎮 Servidor Jogo da Velha Online    ║
║  🚀 Rodando na porta 3000            ║
║  🌐 http://localhost:3000            ║
╚═══════════════════════════════════════╝
```

#### 6️⃣ Acesse o jogo

Abra seu navegador em:
```
http://localhost:3000
```

---

## 🎮 Guia de Uso

### Modo Solo (Vs IA)

```
┌─────────────────────────────────────┐
│ 1. Clique em "🤖 Vs IA"            │
│ 2. Escolha a dificuldade            │
│ 3. Clique em uma casa vazia         │
│ 4. IA joga automaticamente          │
│ 5. Continue até vencer/empatar      │
└─────────────────────────────────────┘
```

**Atalhos de Teclado:**
- `Tab` - Navegar entre casas
- `Enter` ou `Espaço` - Selecionar casa
- `Esc` - Fechar modal

**Recursos Adicionais:**
- **Histórico**: Navegue pelas jogadas com ⬅️ Desfazer / ➡️ Refazer
- **Reiniciar**: Limpa o tabuleiro (placar mantido)
- **Zerar Placar**: Reseta estatísticas
- **Preview**: Passe o mouse sobre as casas para ver prévia

---

### Modo Multiplayer Online

#### Opção 1: Jogar Localmente (Teste)

```
┌────────────────────────────────────────────┐
│ 1. Abra DUAS abas do navegador            │
│    - Aba 1: http://localhost:3000         │
│    - Aba 2: http://localhost:3000         │
│                                            │
│ 2. Em CADA aba:                            │
│    - Clique "🌐 Multiplayer Online"        │
│    - Digite um nome diferente              │
│      • Aba 1: "Jogador1"                   │
│      • Aba 2: "Jogador2"                   │
│    - Clique "🔍 Buscar Partida"            │
│                                            │
│ 3. Match automático!                       │
│    - Aba 1: "Você é X - vs Jogador2"      │
│    - Aba 2: "Você é O - vs Jogador1"      │
│                                            │
│ 4. Jogue alternadamente                    │
│    - Turno mostra: "VEZ DE JOGADOR1"      │
│    - Use o chat para conversar             │
└────────────────────────────────────────────┘
```

#### Opção 2: Jogar com Amigos (Mesma Rede Wi-Fi)

**🖥️ HOST (quem roda o servidor):**

1. **Descubra seu IP local:**
   ```bash
   # Windows
   ipconfig
   # Procure por "IPv4 Address": 192.168.X.X
   
   # Linux/Mac
   ifconfig
   # Procure por "inet": 192.168.X.X
   ```

2. **Inicie o servidor:**
   ```bash
   npm start
   ```

3. **Compartilhe com amigos:**
   ```
   http://192.168.X.X:3000
   ```
   (substitua X.X pelo seu IP)

**👥 JOGADORES:**

1. Conecte-se na **mesma rede Wi-Fi**
2. Acesse a URL compartilhada pelo host
3. Entre no modo multiplayer e busque partida!

#### Opção 3: Jogar pela Internet (Deploy Online)

**Deploy no Render (GRATUITO):**

1. Crie conta em [render.com](https://render.com)

2. Conecte seu repositório GitHub

3. Configure o deploy:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. Após deploy, você recebe uma URL:
   ```
   https://seu-jogo-da-velha.onrender.com
   ```

5. **Compartilhe essa URL** com qualquer pessoa no mundo!

**Outras opções de deploy:**
- [Railway.app](https://railway.app) - Gratuito e fácil
- [Heroku](https://heroku.com) - Gratuito com limitações
- [Vercel](https://vercel.com) - Para frontend (precisa adaptar)
- [DigitalOcean](https://digitalocean.com) - Pago mas poderoso

---

## 💬 Usando o Chat

O chat funciona apenas no modo multiplayer:

```
┌──────────────────────────────────┐
│ 💬 Chat                          │
├──────────────────────────────────┤
│ Maria: Boa sorte!                │
│                    João: Valeu! ⬅│
│ Maria: Essa foi boa!             │
│                 João: Obrigado! ⬅│
├──────────────────────────────────┤
│ [Digite aqui...         ] [Enviar]│
└──────────────────────────────────┘
```

- Suas mensagens aparecem **à direita** (azul)
- Mensagens do oponente **à esquerda** (rosa)
- Pressione **Enter** para enviar
- Máximo 200 caracteres por mensagem

---

## 🧠 Como Funciona o Algoritmo Minimax

O Minimax é uma técnica de inteligência artificial que simula todas as jogadas possíveis e escolhe a melhor.

### Conceito Básico:

```
              Estado Atual
                  │
         ┌────────┼────────┐
         │        │        │
      Jogada A  Jogada B  Jogada C
         │        │        │
    [Simula]  [Simula]  [Simula]
         │        │        │
      Pontos:  Pontos:  Pontos:
        +10      -5       +8
         │        │        │
         └────────┼────────┘
                  │
         Escolhe a maior: A (+10)
```

**Por que é imbatível?**
- Analisa **TODAS** as jogadas possíveis (até 362.880 estados)
- Sempre escolhe a melhor jogada
- Assume que o oponente também joga perfeitamente

---

## 🌐 Arquitetura Multiplayer

### Como funciona a comunicação em tempo real:

```
┌─────────────┐                    ┌─────────────┐
│  Jogador 1  │                    │  Jogador 2  │
│ (Navegador) │                    │ (Navegador) │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │    WebSocket (Socket.IO)         │
       │          Bidirecional            │
       │                                  │
       └────────────┬─────────────────────┘
                    │
         ┌──────────▼──────────┐
         │  SERVIDOR NODE.JS   │
         │                     │
         │  • Matchmaking      │
         │  • Salas de jogo    │
         │  • Validação        │
         │  • Sincronização    │
         └─────────────────────┘
```

**Vantagens do WebSocket:**
- ✅ Comunicação em tempo real
- ✅ Conexão persistente (não precisa recarregar)
- ✅ Baixa latência
- ✅ Eficiente (não fica fazendo polling)

---

## ✨ Recursos e Funcionalidades

### 🎨 Design e UX
- ✅ **Design Cyberpunk** único com paleta neon
- ✅ **Animações suaves** em todas as interações
- ✅ **Linha de vitória animada** riscando as peças
- ✅ **Confete** ao vencer
- ✅ **Preview** da jogada ao passar mouse
- ✅ **100% Responsivo** - funciona em mobile
- ✅ **Grid animado** no background

### 🧠 Inteligência
- ✅ **Algoritmo Minimax** com recursão
- ✅ **3 níveis de dificuldade**
- ✅ **IA imbatível** no modo difícil

### 💾 Persistência
- ✅ **Placar salvo** com localStorage
- ✅ **Histórico de jogadas** com Undo/Redo (modo solo)
- ✅ **Dados persistem** mesmo atualizando a página

### 🌐 Multiplayer
- ✅ **Matchmaking automático**
- ✅ **Chat em tempo real**
- ✅ **Sincronização perfeita**
- ✅ **Validação server-side**
- ✅ **Detecção de desconexão**
- ✅ **Nomes personalizados** no indicador de turno

### ♿ Acessibilidade
- ✅ **Navegação por teclado** completa
- ✅ **ARIA labels** em todos os elementos
- ✅ **Focus visível** customizado
- ✅ **Screen reader friendly**

---

## 🛠️ Tecnologias Utilizadas

### Frontend
| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura semântica |
| **CSS3** | Estilização e animações |
| **JavaScript ES6+** | Lógica do jogo |
| **LocalStorage API** | Persistência de dados |

### Backend
| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime JavaScript |
| **Express** | Servidor web |
| **Socket.IO** | WebSocket em tempo real |

### Algoritmos
| Algoritmo | Aplicação |
|-----------|-----------|
| **Minimax** | IA do jogo |
| **Recursão** | Árvore de decisão |
| **WebSocket** | Comunicação real-time |

---

## 🐛 Solução de Problemas

### Problema: Servidor não inicia

```bash
# Erro: "Cannot find module"
Solução: npm install

# Erro: "Port 3000 already in use"
Solução: PORT=8080 npm start

# Erro: "Node version too old"
Solução: Atualize Node.js para v14+
```

### Problema: Não encontra oponente

```
Solução:
1. Certifique-se que o servidor está rodando
2. Abra DUAS abas diferentes
3. Ambas devem clicar em "Buscar Partida"
4. Aguarde alguns segundos
```

### Problema: Jogadas não sincronizam

```
Solução:
1. Verifique conexão com internet
2. Atualize a página (F5)
3. Veja o console (F12) para erros
4. Reinicie o servidor
```

---

## 📝 Comandos Úteis

```bash
# Instalação
npm install                  # Instala dependências

# Execução
npm start                    # Inicia servidor (produção)
npm run dev                  # Inicia com nodemon (desenvolvimento)

# Verificação
node --version              # Verifica versão do Node
npm --version               # Verifica versão do npm

# Limpeza
npm cache clean --force     # Limpa cache do npm
rm -rf node_modules         # Remove dependências
npm install                 # Reinstala tudo

# Git
git add .                   # Adicionar tudo
git commit -m "mensagem"    # Commit
git push origin main        # Enviar para GitHub
```

---

## 🚀 Melhorias Futuras

- [x] Modo Solo com IA ✅
- [x] Modo Multiplayer Online ✅
- [x] Chat em tempo real ✅
- [x] Nomes personalizados ✅
- [ ] Salas privadas com código
- [ ] Sistema de ranking global
- [ ] Replay de partidas
- [ ] Temas visuais alternativos
- [ ] Sons e efeitos sonoros
- [ ] Torneios automáticos

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

---

## 👤 Autor

**Seu Nome**

- 🌐 Portfolio: [seu-portfolio.com](https://seu-portfolio.com)
- 💼 LinkedIn: [linkedin.com/in/seu-perfil](https://linkedin.com/in/seu-perfil)
- 🐙 GitHub: [@seu-usuario](https://github.com/seu-usuario)
- 📧 Email: seu-email@example.com

---

## 📚 Documentação Adicional

- 📖 [MULTIPLAYER_GUIDE.md](MULTIPLAYER_GUIDE.md) - Guia completo de multiplayer
- 🎓 [COMO_FUNCIONA.md](COMO_FUNCIONA.md) - Explicação técnica detalhada

---

## ⭐ Apoie o Projeto

Se este projeto foi útil para você:

1. ⭐ Dê uma **estrela** no GitHub
2. 🍴 **Fork** e contribua com melhorias
3. 🐛 Reporte **bugs** na aba Issues
4. 📢 **Compartilhe** com amigos

---

<div align="center">

### 🎮 Divirta-se Jogando! 🎮

**Desenvolvido com 💜 e muito ☕**

</div>
