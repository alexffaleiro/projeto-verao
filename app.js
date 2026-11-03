// Configuração do seu Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBpGqzNtj_arT31OrsU4D8Y_jczOGDJLcQ",
    authDomain: "projeto-verao-2027-araweb.firebaseapp.com",
    databaseURL: "https://projeto-verao-2027-araweb-default-rtdb.firebaseio.com",
    projectId: "projeto-verao-2027-araweb",
    storageBucket: "projeto-verao-2027-araweb.firebasestorage.app",
    messagingSenderId: "619260309049",
    appId: "1:619260309049:web:50c213394aebd006e027e8",
    measurementId: "G-5F6MXB0E9K"
};

// Inicializa Firebase (Compatível com os scripts que colocamos no index.html)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Treinos Fixos (Hardcoded) para o primeiro mês
const treinosDeHoje = [
    "Aquecimento: 5km corrida/caminhada",
    "Musculação: Treino de Força do dia",
    "Alongamento / Mobilidade"
];

// Renderiza a lista de treinos
function carregarTreinos() {
    const workoutList = document.getElementById('workoutList');
    workoutList.innerHTML = treinosDeHoje.map((treino, index) => `
        <div class="workout-item">
            <input type="checkbox" id="treino-${index}" onchange="marcarTreino('${treino}', this.checked)">
            <label for="treino-${index}">${treino}</label>
        </div>
    `).join('');
}

// Função para Salvar Alimentação
async function adicionarRefeicao() {
    const user = document.getElementById('userSelect').value;
    const meal = document.getElementById('mealInput').value;
    
    if (!meal) {
        alert("Por favor, digite a refeição.");
        return;
    }

    try {
        await db.ref('feed').push({
            user: user,
            type: 'Alimentação',
            content: meal,
            timestamp: Date.now()
        });
        document.getElementById('mealInput').value = ''; 
    } catch (error) {
        console.error("Erro ao guardar refeição:", error);
        alert("Erro ao guardar. Verifique as regras do Firebase.");
    }
}

// Função para Salvar Treino
async function marcarTreino(treino, concluido) {
    const user = document.getElementById('userSelect').value;
    
    if (concluido) {
        try {
            await db.ref('feed').push({
                user: user,
                type: 'Treino',
                content: `Concluiu: ${treino}`,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("Erro ao marcar treino:", error);
        }
    }
}

// Escutar o Banco de Dados em Tempo Real para preencher o Feed
function escutarFeed() {
    db.ref('feed').orderByChild('timestamp').limitToLast(50).on('value', snapshot => {
        const feedList = document.getElementById('feedList');
        feedList.innerHTML = ''; 
        
        const dados = [];
        snapshot.forEach(child => { 
            dados.push(child.val()); 
        });
        
        dados.reverse().forEach(item => {
            const data = new Date(item.timestamp);
            const horaFormatada = data.getHours().toString().padStart(2, '0') + ':' + data.getMinutes().toString().padStart(2, '0');
            const dataFormatada = data.getDate().toString().padStart(2, '0') + '/' + (data.getMonth() + 1).toString().padStart(2, '0');
            
            feedList.innerHTML += `
                <li class="feed-item">
                    <div class="feed-meta">${item.user} • ${item.type} • ${dataFormatada} às ${horaFormatada}</div>
                    <div class="feed-content">${item.content}</div>
                </li>
            `;
        });
    });
}

// Inicializar as funções ao carregar a página
carregarTreinos();
escutarFeed();