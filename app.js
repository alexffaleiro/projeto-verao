// Configuração do Firebase
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

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Treinos fixos
const treinosDeHoje = [
    "Aquecimento: 5km corrida/caminhada",
    "Musculação: Treino de Força do dia",
    "Alongamento / Mobilidade"
];

// Renderiza os treinos
function carregarTreinos() {
    const workoutList = document.getElementById("workoutList");

    workoutList.innerHTML = treinosDeHoje
        .map((treino, index) => `
            <div class="workout-item">
                <input
                    type="checkbox"
                    id="treino-${index}"
                    onchange="marcarTreino('${treino}', this.checked)"
                >

                <label for="treino-${index}">
                    ${treino}
                </label>
            </div>
        `)
        .join("");
}

// Salvar alimentação
async function adicionarRefeicao() {
    const user = document.getElementById("userSelect").value;
    const mealInput = document.getElementById("mealInput");
    const meal = mealInput.value.trim();

    if (!meal) {
        alert("Por favor, digite a refeição.");
        return;
    }

    try {
        await db.ref("feed").push({
            user,
            type: "Alimentação",
            content: meal,
            timestamp: Date.now()
        });

        mealInput.value = "";

    } catch (error) {
        console.error("Erro ao guardar refeição:", error);
        alert("Não foi possível salvar a refeição.");
    }
}

// Salvar treino concluído
async function marcarTreino(treino, concluido) {
    if (!concluido) {
        return;
    }

    const user = document.getElementById("userSelect").value;

    try {
        await db.ref("feed").push({
            user,
            type: "Treino",
            content: `Concluiu: ${treino}`,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error("Erro ao marcar treino:", error);
        alert("Não foi possível registrar o treino.");
    }
}

// Excluir um registro definitivamente
async function excluirRegistro(id) {
    const confirmar = confirm(
        "Deseja realmente excluir este registro? Esta ação será definitiva para todos."
    );

    if (!confirmar) {
        return;
    }

    try {
        await db.ref(`feed/${id}`).remove();

    } catch (error) {
        console.error("Erro ao excluir registro:", error);
        alert("Não foi possível excluir este registro.");
    }
}

// Cria visualmente um item do feed
function criarItemFeed(id, item) {
    const data = new Date(item.timestamp);

    const dataFormatada =
        data.getDate().toString().padStart(2, "0") +
        "/" +
        (data.getMonth() + 1).toString().padStart(2, "0");

    const horaFormatada =
        data.getHours().toString().padStart(2, "0") +
        ":" +
        data.getMinutes().toString().padStart(2, "0");

    const li = document.createElement("li");
    li.className = "feed-item";

    const meta = document.createElement("div");
    meta.className = "feed-meta";
    meta.textContent = `${item.type} • ${dataFormatada} às ${horaFormatada}`;

    const content = document.createElement("div");
    content.className = "feed-content";
    content.textContent = item.content;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "🗑 Excluir";
    deleteButton.setAttribute(
        "aria-label",
        `Excluir registro de ${item.user}`
    );

    deleteButton.addEventListener("click", () => excluirRegistro(id));

    li.appendChild(meta);
    li.appendChild(content);
    li.appendChild(deleteButton);

    return li;
}

// Escuta o Firebase e organiza os registros por pessoa
function escutarFeed() {
    db.ref("feed")
        .orderByChild("timestamp")
        .limitToLast(100)
        .on("value", (snapshot) => {

            const feeds = {
                Alex: [],
                Rita: [],
                Arthur: []
            };

            snapshot.forEach((child) => {
                const item = child.val();

                if (feeds[item.user]) {
                    feeds[item.user].push({
                        id: child.key,
                        ...item
                    });
                }
            });

            Object.keys(feeds).forEach((user) => {
                const feedList = document.getElementById(`feed-${user}`);

                feedList.innerHTML = "";

                feeds[user]
                    .reverse()
                    .forEach((item) => {
                        feedList.appendChild(
                            criarItemFeed(item.id, item)
                        );
                    });
            });
        });
}

// Inicialização
carregarTreinos();
escutarFeed();