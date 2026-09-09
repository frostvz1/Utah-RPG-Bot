<p align="center">
  <img src="assets/Utah-RPG-git.jpg" alt="UTAH-RPG Bot" width="700">
</p>

# # UTAH-RPG Bot

Framework e base de desenvolvimento para bots e sistemas de RPG.

Desenvolvido por Utah Frost & Riven Void

---

## Sobre o projeto

O UTAH-RPG Bot é uma base desenvolvida para facilitar a criação,
organização e expansão de sistemas de RPG.

O projeto foi desenvolvido com foco em modularidade, organização e
facilidade de aprendizado, permitindo que desenvolvedores estudem
a estrutura do código, criem novos comandos e desenvolvam seus
próprios sistemas.

---

## Objetivos

O UTAH-RPG possui como principais objetivos:

- Facilitar o desenvolvimento de bots de RPG.
- Servir como base para novos projetos.
- Ensinar conceitos de desenvolvimento através de exemplos práticos.
- Permitir a criação de novos comandos e sistemas.
- Organizar funcionalidades de forma modular.
- Disponibilizar uma base que possa ser modificada e expandida.

---

## Requisitos

Antes de executar o projeto, certifique-se de possuir:

- Node.js
- npm
- Git
- Terminal Linux, Termux ou ambiente compatível

---

## Instalação

Clone o repositório:

    git clone https://github.com/frostvz1/Utah-RPG-Bot.git

Entre na pasta:

    cd Utah-RPG-Bot

Instale as dependências:

    npm install

---

## Configuração

Antes de iniciar o projeto, verifique os arquivos de configuração
existentes no projeto.

Caso exista um arquivo `.env.example`, faça uma cópia:

    cp .env.example .env

Depois configure as variáveis necessárias no arquivo `.env`.

Nunca publique senhas, tokens, chaves de API ou outras credenciais
diretamente no código ou no GitHub.

---

## Executando

Depois de instalar e configurar o projeto, execute o comando
correspondente ao script definido no `package.json`.

Exemplo:

    npm start

Caso o projeto utilize outro script, consulte o `package.json`.

---

# Documentação

A documentação está organizada para facilitar o aprendizado.

## Instalação

Aprenda a instalar o UTAH-RPG em seu ambiente.

Consulte:

    docs/INSTALACAO.md

## Configuração

Aprenda a configurar o projeto.

Consulte:

    docs/CONFIGURACAO.md

## Criando comandos

Aprenda como desenvolver novos comandos.

Consulte:

    docs/CRIANDO-COMANDOS.md

## Criando sistemas

Aprenda como criar e integrar novos sistemas ao projeto.

Consulte:

    docs/CRIANDO-SISTEMAS.md

## Sistema de licenças

Informações sobre o funcionamento do sistema de aluguel/licenciamento.

Consulte:

    docs/SISTEMA-DE-LICENCAS.md

## Sistema de operadores

Documentação relacionada às permissões e operadores.

Consulte:

    docs/OPERADORES.md

## Exemplos

Exemplos de implementação podem ser encontrados em:

    examples/

---

# Estrutura do projeto

A estrutura pode variar conforme a versão do UTAH-RPG.

Uma organização típica pode conter:

    UTAH-RPG/
    ├── src/
    ├── database/
    ├── config/
    ├── docs/
    ├── examples/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── README.md
    └── LICENSE

Consulte os arquivos existentes no projeto para conhecer a estrutura
atual da versão instalada.

---

# Desenvolvimento

O UTAH-RPG foi desenvolvido para ser expandido.

Você pode estudar o código existente e desenvolver:

- Novos comandos
- Sistemas de RPG
- Sistemas administrativos
- Sistemas de economia
- Sistemas de jogadores
- Sistemas de permissões
- Integrações
- Ferramentas administrativas
- Novas funcionalidades

Antes de modificar funcionalidades importantes, recomendamos entender
a estrutura existente do projeto.

---

# Contribuição

Contribuições são permitidas de acordo com os termos da licença.

Para contribuir:

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração.
3. Faça as modificações.
4. Teste o projeto.
5. Faça um commit descrevendo a alteração.
6. Envie um Pull Request.

Exemplo:

    git checkout -b minha-alteracao

Depois:

    git add .

    git commit -m "Adiciona nova funcionalidade"

E então:

    git push origin minha-alteracao

---

# Boas práticas

Ao desenvolver para o UTAH-RPG:

- Mantenha o código organizado.
- Evite duplicação desnecessária.
- Valide entradas do usuário.
- Trate erros adequadamente.
- Não exponha credenciais.
- Utilize variáveis de ambiente para informações sensíveis.
- Teste alterações antes de enviá-las.
- Mantenha nomes de arquivos e funções claros.
- Documente funcionalidades importantes.

---

# Segurança

Nunca publique no GitHub:

- Senhas
- Tokens
- Chaves de API
- Cookies
- Sessões
- Credenciais de banco de dados
- Arquivos de autenticação
- Informações privadas de usuários

Caso alguma credencial seja publicada acidentalmente, revogue-a e
gere uma nova imediatamente.

---

# Licença

O UTAH-RPG é distribuído sob a MIT License.

Copyright (c) 2026 Utah Frost.

Consulte o arquivo `LICENSE` para os termos completos.

---

# Aluguel e serviços oficiais

O código-fonte do UTAH-RPG é disponibilizado sob os termos da
MIT License.

Serviços oficiais relacionados ao UTAH-RPG, incluindo sistemas de
aluguel, licenciamento, hospedagem, suporte e recursos exclusivos,
podem possuir regras, condições e valores próprios.

A licença do código-fonte não representa automaticamente uma
contratação de serviços oficiais.

---

# Autores

Utah Frost
Riven Void

Projeto:

UTAH-RPG Bot

# Criando comandos no UTAH-RPG

Este documento apresenta os conceitos necessários para desenvolver
novos comandos para o UTAH-RPG.

---

## 1. Entenda a estrutura

Antes de criar um comando, localize a pasta responsável pelos comandos
na versão atual do projeto.

Dependendo da versão, ela pode estar dentro de:

    src/

ou:

    src/commands/

Não crie uma nova estrutura sem antes verificar como os comandos
existentes estão organizados.

---

## 2. Estude um comando existente

A maneira mais segura de aprender é analisar um comando que já funciona.

Observe:

- Como o comando é registrado.
- Como o nome é definido.
- Como os argumentos são recebidos.
- Como a mensagem é enviada.
- Como erros são tratados.
- Como permissões são verificadas.
- Como os dados do usuário são acessados.

---

## 3. Crie uma cópia para estudo

Escolha um comando simples existente e use sua estrutura como referência.

Não copie funcionalidades desnecessárias.

Mantenha somente aquilo que seu novo comando realmente precisa.

---

## 4. Nome do comando

Escolha nomes simples e fáceis de memorizar.

Exemplos:

    perfil
    ajuda
    inventario
    loja
    saldo

Evite nomes excessivamente longos ou confusos.

---

## 5. Argumentos

Comandos podem receber argumentos.

Exemplo conceitual:

    comando <argumento>

Antes de utilizar um argumento, valide se ele realmente existe.

Exemplo:

    Se o usuário não informar o argumento:
        informar como utilizar o comando.

---

## 6. Permissões

Comandos administrativos devem verificar as permissões do usuário
antes de executar ações sensíveis.

Nunca confie somente no nome ou texto enviado pelo usuário.

A verificação deve utilizar o sistema de permissões existente no projeto.

---

## 7. Dados dos usuários

Ao utilizar dados de jogadores:

- Verifique se o usuário existe.
- Crie dados padrão quando necessário.
- Valide os valores recebidos.
- Evite sobrescrever informações sem necessidade.

---

## 8. Tratamento de erros

Um comando não deve derrubar o processo inteiro caso ocorra um erro.

Utilize o mecanismo de tratamento de erros já adotado pelo projeto.

Registre informações úteis para diagnóstico, mas nunca registre
senhas ou tokens.

---

## 9. Testes

Depois de criar o comando:

1. Inicie o projeto.
2. Execute o comando.
3. Teste sem argumentos.
4. Teste com argumentos inválidos.
5. Teste com argumentos válidos.
6. Teste permissões.
7. Verifique os logs.
8. Confirme que outros comandos continuam funcionando.

---

## 10. Boas práticas

Um bom comando deve ser:

- Simples.
- Legível.
- Seguro.
- Modular.
- Fácil de modificar.
- Fácil de testar.

---

## Próximo passo

Depois de entender os comandos existentes, consulte:

    docs/CRIANDO-SISTEMAS.md

para aprender como desenvolver funcionalidades maiores.

# Instalação do UTAH-RPG

## Requisitos

É recomendado utilizar:

- Node.js
- npm
- Git
- Termux ou Linux

---

# Termux

## 1. Atualize os pacotes

    pkg update
    pkg upgrade

---

## 2. Instale Git

    pkg install git

Verifique:

    git --version

---

## 3. Instale Node.js

    pkg install nodejs

Verifique:

    node --version

E:

    npm --version

---

## 4. Clone o projeto

    git clone https://github.com/frostvz1/Utah-RPG-Bot.git

---

## 5. Entre na pasta

    cd Utah-RPG-Bot

---

## 6. Instale as dependências

    npm install

---

## 7. Configure o projeto

Consulte:

    docs/CONFIGURACAO.md

---

## 8. Execute

Utilize o script definido no `package.json`.

Exemplo:

    npm start

---

# Atualizando o projeto

Para obter as alterações mais recentes:

    git pull

Caso você tenha modificações locais, faça backup ou commit antes
de atualizar o projeto.

---

# Problemas

Se ocorrer um erro durante a instalação:

1. Leia a mensagem apresentada no terminal.
2. Verifique a versão do Node.js.
3. Execute novamente `npm install`.
4. Confira o arquivo `package.json`.
5. Consulte a documentação.

# Configuração do UTAH-RPG

A configuração pode variar entre versões.

Antes de executar o projeto, examine os arquivos de configuração
presentes no repositório.

---

## Variáveis de ambiente

Caso exista `.env.example`:

    cp .env.example .env

Depois abra o `.env` e configure os valores necessários.

---

## Segurança

O arquivo `.env` normalmente contém informações que não devem ser
publicadas.

Verifique se `.env` está incluído no `.gitignore`.

Nunca publique:

- Tokens
- Senhas
- API Keys
- Credenciais
- Cookies
- Sessões
- Dados privados

---

## Configurações do bot

As configurações disponíveis dependem da versão instalada.

Antes de alterar uma opção, procure sua definição no código.

Não adicione variáveis arbitrárias esperando que o sistema reconheça
automaticamente a configuração.

---

## Banco de dados

Caso a versão utilize banco de dados ou arquivos locais, faça backup
antes de realizar alterações estruturais.

Não compartilhe bancos contendo informações privadas.

---

## Depois da configuração

Execute o projeto e confirme:

- O processo iniciou corretamente.
- Não existem erros de configuração.
- Os módulos foram carregados.
- Os comandos estão disponíveis.
- Os sistemas necessários estão funcionando.

# Criando sistemas no UTAH-RPG

Um sistema é uma funcionalidade maior composta por uma ou mais
partes do projeto.

Exemplos:

- Economia
- Inventário
- Missões
- Níveis
- Experiência
- Licenças
- Operadores
- Administração

---

## 1. Planeje antes de programar

Defina:

- Objetivo do sistema.
- Dados necessários.
- Comandos envolvidos.
- Permissões necessárias.
- Eventos envolvidos.
- Persistência dos dados.
- Possíveis erros.

---

## 2. Separe responsabilidades

Evite colocar todo o sistema em um único arquivo.

Sempre que possível, mantenha:

- Comandos
- Regras de negócio
- Persistência
- Configurações

separados.

Isso facilita manutenção e testes.

---

## 3. Persistência

Se o sistema precisar guardar dados, utilize o mecanismo de persistência
já utilizado pelo UTAH-RPG.

Evite criar diferentes métodos de armazenamento para a mesma finalidade.

---

## 4. Validação

Todos os dados recebidos externamente devem ser tratados como não
confiáveis.

Valide:

- Tipos.
- Valores.
- Argumentos.
- IDs.
- Permissões.
- Estados do sistema.

---

## 5. Integração

Ao adicionar um sistema novo, verifique se ele interfere em:

- Comandos existentes.
- Banco de dados.
- Sistema de permissões.
- Sistema de licenças.
- Inicialização do bot.
- Eventos.

---

## 6. Testes

Teste tanto o funcionamento normal quanto situações inesperadas.

Exemplos:

- Usuário inexistente.
- Argumento inválido.
- Dados ausentes.
- Permissão insuficiente.
- Sistema desativado.
- Erro de banco de dados.

---

# Regra principal

Antes de alterar uma parte fundamental do UTAH-RPG, entenda como ela
é utilizada pelo restante do projeto.

Uma alteração pequena pode afetar vários sistemas.

# Sistema de Licenças

O UTAH-RPG pode utilizar mecanismos de licença ou aluguel para
controlar o acesso a determinados serviços ou instalações.

A implementação exata depende da versão do projeto.

---

## Conceito

Uma licença pode representar a autorização para determinado grupo,
instância ou instalação utilizar um serviço durante determinado
período.

Exemplo conceitual:

    Grupo
       |
       v
    Licença
       |
       +---- Ativa
       |
       +---- Expirada
       |
       +---- Desativada

---

## Estados

Uma licença pode possuir estados diferentes.

Exemplos:

- Ativa
- Expirada
- Desativada
- Suspensa

Os estados reais dependem da implementação presente no código.

---

## Validação

Antes de executar uma funcionalidade protegida, o sistema deve
verificar se a licença necessária está válida.

---

## Expiração

Quando uma licença ultrapassa seu período de validade, o sistema
pode bloquear funcionalidades protegidas.

---

## Administração

Operações administrativas devem ser restritas a usuários autorizados.

Nunca permita que um usuário comum altere sua própria licença
simplesmente enviando um comando.

---

## Segurança

O sistema de licenciamento deve validar as informações no servidor.

Não confie em valores enviados pelo cliente.

---

## Serviços oficiais

O código do sistema pode ser estudado e modificado conforme a licença
do projeto.

Serviços oficiais de aluguel, hospedagem, suporte ou infraestrutura
podem possuir condições próprias.

# Sistema de Operadores

O sistema de operadores permite atribuir permissões específicas a
determinados usuários.

---

## Conceito

Um operador é um usuário autorizado a executar determinadas funções
administrativas.

Exemplo conceitual:

    Usuário
       |
       v
    Operador
       |
       +---- Permissões
       |
       +---- Comandos administrativos

---

## Permissões

As permissões devem ser verificadas antes da execução de operações
administrativas.

---

## Boas práticas

Nunca considere que um usuário possui permissão apenas porque conhece
o nome de um comando.

A autorização deve ser verificada pelo sistema.

---

## Segurança

Operações como:

- Alterar configurações.
- Gerenciar licenças.
- Administrar usuários.
- Executar funções críticas.

devem possuir proteção adequada.

---

## Desenvolvimento

Ao criar um novo comando administrativo, utilize o mecanismo de
permissões já existente no projeto.

Não crie uma segunda implementação de permissões sem necessidade.