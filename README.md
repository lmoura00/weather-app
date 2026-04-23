Weather App ⛈️
Uma aplicação móvel moderna e intuitiva desenvolvida com React Native e Expo, que permite consultar informações meteorológicas detalhadas de qualquer cidade do mundo em tempo real.

✨ Funcionalidades
Busca por Cidade: Pesquise o clima de qualquer localização digitando o nome da cidade.

Localização Atual (GPS): Obtenha a previsão exata para a sua posição atual com apenas um clique.

Interface Dinâmica: O fundo e as animações da aplicação mudam automaticamente entre o modo dia (céu limpo, nuvens, aviões de papel) e modo noite (estrelas interativas e astronautas), dependendo do horário local da cidade pesquisada.

Informações Detalhadas: Exibição de temperatura (atual, mínima e máxima), sensação térmica, humidade, velocidade e direção do vento, pressão atmosférica, visibilidade e horários do nascer e pôr do sol.

Animações Lottie: Utilização de animações ricas e fluidas para representar diferentes estados climáticos (chuva, neve, tempestade, etc.).

🚀 Tecnologias Utilizadas
React Native: Framework para desenvolvimento cross-platform.

Expo: Plataforma de ferramentas para facilitar o desenvolvimento e testes.

TypeScript: Adição de tipagem estática para maior segurança e escalabilidade do código.

Axios: Cliente HTTP para consumo da API.

Lottie React Native: Biblioteca para renderizar animações baseadas em JSON.

OpenWeatherMap API: Fonte de dados meteorológicos globais.

🛠️ Como Executar o Projeto
Pré-requisitos
Node.js instalado.

Expo Go instalado no seu dispositivo móvel (ou um simulador Android/iOS configurado).

Instalação
Clone o repositório:

Bash
git clone https://github.com/seu-usuario/weather-app.git
Aceda à pasta do projeto:

Bash
cd weather-app
Instale as dependências:

Bash
npm install
Inicie o servidor do Expo:

Bash
npm start
Leia o código QR exibido no terminal com a aplicação Expo Go (Android) ou a câmara (iOS).

📄 Estrutura de Ficheiros Principal
App.tsx: Contém a lógica principal, estados da aplicação e toda a interface do utilizador.

package.json: Gestão de dependências e scripts de execução.

/assets: Contém as imagens e os ficheiros JSON das animações Lottie.

📝 Notas de Implementação
A aplicação utiliza o SafeAreView para garantir a correta exibição em dispositivos com entalhes (notches) e o useMemo para otimizar a renderização das estrelas no modo noturno, garantindo que a posição dos elementos visuais permaneça consistente entre atualizações de estado.

Desenvolvido por Lucas de Moura Galvão.


<img width="1206" height="2622" alt="image" src="https://github.com/user-attachments/assets/6e9067d8-5618-4011-b01a-606eca829dbb" />
<img width="1206" height="2622" alt="image" src="https://github.com/user-attachments/assets/1c28e29b-6b78-4088-a35a-182e375333ab" />
<img width="1206" height="2622" alt="image" src="https://github.com/user-attachments/assets/6add07ef-6302-4fa8-b48b-0bf14e12cc84" />
<img width="1206" height="2622" alt="image" src="https://github.com/user-attachments/assets/cb7b14fc-cca4-4d4f-9a94-a714032b209a" />
<img width="1206" height="2622" alt="image" src="https://github.com/user-attachments/assets/5010c25e-793c-4377-ad85-74d536f29450" />




