# 🚀 Guia de Deploy no EasyPanel & Publicação na Play Store

Este guia explica como hospedar o **QA - Estude para Concursos** no seu servidor com **EasyPanel**, configurar seu domínio com SSL grátis e gerar o arquivo pronto para publicar na **Google Play Store**.

---

## 📦 1. Estrutura de Arquivos de Deploy Criada

Os seguintes arquivos já estão prontos na raiz do seu projeto:

| Arquivo | Função |
| :--- | :--- |
| [`Dockerfile`](Dockerfile) | Imagem Node.js 22 LTS Alpine leve com volume de persistência |
| [`docker-compose.yml`](docker-compose.yml) | Configuração para deploy direto no EasyPanel com 1 clique |
| [`.dockerignore`](.dockerignore) | Otimiza o build ignorando arquivos desnecessários |
| [`public/ads.txt`](public/ads.txt) | Arquivo exigido pelo Google AdSense / AdMob |
| [`public/privacy.html`](public/privacy.html) | Política de Privacidade oficial exigida pela Play Store |
| [`public/manifest.json`](public/manifest.json) | Manifesto do aplicativo Android / iOS |

---

## 🛠️ 2. Passo a Passo de Deploy no seu EasyPanel

### Passo 1: Criar o Projeto e Serviço no EasyPanel
1. Acesse o painel do seu **EasyPanel** (ex: `http://seu-ip:3000`).
2. Clique em **+ New Project** e dê o nome: `qa-concursos`.
3. Dentro do projeto, clique em **+ Service** ➔ escolha **App**.
4. Dê o nome para o serviço: `app`.

### Passo 2: Fonte do Código (Source)
Você tem duas opções fáceis:
* **Opção A (Via GitHub / Git - Recomendada)**:
  - Selecione **GitHub**.
  - Conecte o repositório onde está o código.
  - O EasyPanel detectará o `Dockerfile` automaticamente.
* **Opção B (Via Docker Compose)**:
  - Crie um serviço do tipo **Docker Compose** e cole o conteúdo de [`docker-compose.yml`](docker-compose.yml).

### Passo 3: Configurar Porta e Variáveis de Ambiente (Environment)
No menu lateral do serviço no EasyPanel:
1. Vá na aba **Environment** e adicione as variáveis:
   ```env
   NODE_ENV=production
   PORT=3333
   GEMINI_API_KEY=sua_chave_gemini_aqui
   GOOGLE_ADSENSE_PUB_ID=pub-3709245247171200
   ```
2. Na aba **General**:
   - Defina a porta da aplicação como: **`3333`**.

### Passo 4: Volume de Persistência (Para não perder dados ao atualizar)
1. Vá na aba **Mounts / Volumes**.
2. Adicione um volume:
   - **Host Path / Volume Name**: `qa_data`
   - **Mount Path**: `/app/data`

### Passo 5: Configurar Domínio com SSL / HTTPS Grátis
1. Na aba **Domains**:
   - Clique em **+ Add Domain**.
   - Digite o seu domínio ou subdomínio (ex: `app.seudominio.com.br` ou `concursos.seudominio.com.br`).
   - Aponte a porta para: **`3333`**.
2. O EasyPanel irá gerar o certificado **HTTPS (Let's Encrypt)** automaticamente em menos de 1 minuto!

### Passo 6: Clicar em Deploy
- Clique no botão verde **Deploy**. Em cerca de 30 a 60 segundos, seu aplicativo estará online 24h por dia no seu domínio com HTTPS seguro!

---

## 📱 3. Como Gerar o Arquivo para a Google Play Store (`.aab` / `.apk`)

Depois que o app estiver rodando no seu domínio no EasyPanel (ex: `https://app.seudominio.com.br`), você não precisa reescrever nada de código:

1. Acesse o site oficial da Microsoft & Google: **[https://www.pwabuilder.com](https://www.pwabuilder.com)**.
2. Digite o seu domínio HTTPS (ex: `https://app.seudominio.com.br`) e clique em **Start**.
3. O PWABuilder vai validar:
   - ✅ Manifest: 100% OK
   - ✅ Service Worker: 100% OK
   - ✅ Segurança HTTPS: 100% OK
4. Clique no botão **"Package for Store"** ➔ selecione **Google Play**.
5. Ele irá gerar o pacote **`.aab` (Android App Bundle)** assinado e pronto para subir no **Google Play Console**!

---

## 📋 4. O que colocar no Google Play Console:

* **Nome do App**: QA - Estude para Concursos
* **Categoria**: Educação
* **URL da Política de Privacidade**: `https://seu-dominio.com.br/privacy.html`
* **Monetização**: Marque que o aplicativo contém anúncios (Google AdMob) e compras no aplicativo.
