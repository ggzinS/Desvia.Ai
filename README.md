# 🗺️ Rotas-Seguras

Bem-vindo ao repositório do projeto **Rotas-Seguras**.

> 🚧 **Atenção:** Este projeto é um protótipo e está em fase inicial de desenvolvimento. As funcionalidades e conceitos aqui descritos são uma prova de conceito e estão sujeitos a alterações.

## 🎯 Nosso Objetivo

A segurança urbana é uma preocupação constante. O objetivo deste projeto é explorar como a tecnologia móvel pode ser usada para oferecer mais tranquilidade durante os deslocamentos diários, seja caminhando, dirigindo ou estacionando.

## 💡 O Conceito

O **Rotas-Seguras** está sendo desenvolvido como um aplicativo de segurança pessoal que utiliza tecnologia de localização em tempo real. A ideia central é fornecer ferramentas de fácil acesso para o usuário e explorar conceitos de planejamento de trajetos.

### Conceitos Atuais (Em Desenvolvimento):

O protótipo atual inclui a interface para as seguintes ideias:

  * 📍 **Mapa Interativo:** Visualização da localização atual do usuário.
  * 🆘 **Botão de SOS:** Um recurso de acesso rápido para alertas em situações de emergência.
  * 🧭 **Planejamento de Trajetos:** Interface para busca de destinos (aba "Rotas").
  * 🛡️ **Função Guardião:** Um conceito para compartilhamento de informações de segurança.
  * 📢 **Função Reporte:** Uma ideia para permitir o compartilhamento de informações entre a comunidade.
  * 🚗 **Função Estacione:** Ferramenta de auxílio para estacionamento.

-----

## 👨‍💻 Para Desenvolvedores

Esta seção detalha a estrutura técnica do projeto e como colocá-lo em funcionamento.

### 🛠️ Tecnologias Utilizadas

Este é um aplicativo móvel desenvolvido com:

  * **React Native (com Expo)**: Um framework para construir aplicativos nativos usando React.
  * **TypeScript**: Para um código mais robusto e com tipagem estrita.
  * **Expo Location**: Utilizado para obter as permissões e a localização atual do usuário.
  * **React Native Maps**: Para a renderização dos mapas e marcadores na tela.

### 🚀 Como Executar o Projeto

1.  **Clone o repositório:**

    ```bash
    git clone [URL_DO_REPOSITORIO]
    cd Rotas-Seguras
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento (Expo):**
    Os seguintes scripts estão disponíveis no `package.json`:

      * Para iniciar o Expo Metro Bundler:
        ```bash
        npm start
        ```
      * Para iniciar no Android:
        ```bash
        npm run android
        ```
      * Para iniciar no iOS:
        ```bash
        npm run ios
        ```
      * Para rodar a versão web:
        ```bash
        npm run web
        ```

4.  **Abra no seu dispositivo:**
    Após rodar `npm start`, escaneie o QR Code exibido no terminal usando o aplicativo Expo Go (disponível para Android e iOS).