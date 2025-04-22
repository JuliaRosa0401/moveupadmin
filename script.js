const baseUrl = "https://api-catraca-weld.vercel.app/alunos";
const lista_todos = "https://api-catraca-weld.vercel.app/alunos/lista";


// criação
const formularioCriacao = document.getElementById("create-form");
const inputNomeCriacao = document.getElementById("create-name");
const inputCpfCriacao = document.getElementById("create-cpf");
const listaAlunos = document.getElementById("alunos-lista");

// editar
let formularioAtualizacao = document.getElementById('update-form');
let inputAtualizacaoId = document.getElementById('update-id');
let inputNomeAtualizacao = document.getElementById('update-name');
let inputCPFAtualizacao = document.getElementById('update-cpf');
let botaoCancelarAtualizacao = document.getElementById('cancel-update');

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function exibirAlunosNaTela(alunos) {
  listaAlunos.innerHTML = "";

  if (alunos.length === 0) {
    listaAlunos.innerHTML = "<p class='text-gray-400'>Nenhum aluno encontrado.</p>";
    return;
  }

  alunos.forEach(aluno => {
    const div = document.createElement("div");
    div.className = "bg-zinc-700 p-4 rounded-md flex justify-between items-center";

    div.innerHTML = `
      <div>
          <h3 class="font-bold text-white">${aluno.id} - ${aluno.nome}</h3>
          <p class="text-sm text-gray-400">${formatarCPF(aluno.cpf)}</p>
          <p class="text-sm text-sm font-semibold ${aluno.status ? 'text-green-400' : 'text-red-400'}">
           ${aluno.status ? "Ativo" : "Bloqueado"}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs bg-purple-600 px-3 py-1 rounded-full text-white">ID: ${aluno.id}</span>
          
          <button 
            class="edit-btn text-yellow-400 border border-yellow-400 px-2 py-1 rounded-md text-xs hover:bg-yellow-400 hover:text-black transition">
            🖊️ Editar
          </button>
          
          <button onclick="excluirAluno(${aluno.id})"
            class="text-red-500 border border-red-500 px-2 py-1 rounded-md text-xs hover:bg-red-500 hover:text-white transition">
            🗑️ Excluir
          </button>
          
          <button onclick="alterarStatus(${aluno.id})"
            class="text-blue-400 border border-blue-400 px-2 py-1 rounded-md text-xs hover:bg-blue-400 hover:text-black transition">
            🔄 Status
          </button>
      </div>
    `;

    const botaoEditar = div.querySelector('.edit-btn');
    botaoEditar.addEventListener('click', function () {
      console.log(`Botão Editar clicado para o aluno ID: ${aluno.id}`);
      exibirFormularioAtualizacao(aluno.id, aluno.nome, aluno.cpf);
    });

    listaAlunos.appendChild(div);
  });
}

// listar
async function buscarListarAlunos() {
  console.log("Buscando alunos...");
  try {
    listaAlunos.innerHTML = "<p>Carregando alunos...</p>";

    const cpf = await fetch(lista_todos);
    const alunos = await cpf.json();

    exibirAlunosNaTela(alunos);
  } catch (erro) {
    console.error("Erro ao buscar alunos:", erro);
    listaAlunos.innerHTML = `<p class="text-red-500">Erro ao carregar alunos: ${erro.message}</p>`;
  }
}

// adicionar
async function adicionarAluno(evento) {
  evento.preventDefault();
  console.log("Tentando adicionar um novo aluno...");

  const nome = inputNomeCriacao.value.trim();
  const cpf = inputCpfCriacao.value.trim();

  if (!nome || !cpf) {
    alert("Por favor, preencha o nome e CPF.");
    return;
  }

  const novoAluno = {
    nome: nome,
    cpf: cpf 
  };

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(novoAluno)
    });

    const resultadoApi = await response.json();

    if (!response.ok) {
      throw new Error(resultadoApi.mensagem || `Erro ao adicionar aluno: ${response.status}`);
    }

    console.log("Aluno adicionado com sucesso!", resultadoApi);
    alert(resultadoApi.mensagem);

    inputNomeCriacao.value = '';
    inputCpfCriacao.value = '';

    buscarListarAlunos();
  } catch (erro) {
    console.error("Falha ao adicionar aluno:", erro);
    alert(`Erro ao adicionar aluno: ${erro.message}`);
  }
}

// atualizar
async function atualizarAluno(evento) {
  evento.preventDefault();
  console.log("Tentando atualizar aluno...");

  const id = inputAtualizacaoId.value;
  const nome = inputNomeAtualizacao.value;
  const cpf = inputCPFAtualizacao.value;

  const dadosAlunoAtualizada = {
    nome: nome,
    cpf: cpf
  };

  if (!id) {
    console.error("ID da Aluno para atualização não encontrado!");
    alert("Erro interno: ID da Aluno não encontrado para atualizar.");
    return;
  }

  if (!nome || !cpf) {
    alert("Por favor, preencha o nome e o CPF para atualizar.");
    return;
  }

  try {
    const respostaHttp = await fetch(`${baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosAlunoAtualizada)
    });

    const resultadoApi = await respostaHttp.json();

    if (!respostaHttp.ok) {
      throw new Error(resultadoApi.mensagem || `Erro ao atualizar aluno: ${respostaHttp.status}`);
    }

    console.log("Aluno atualizado com sucesso! ID:", id);
    alert(resultadoApi.mensagem);

    esconderFormularioAtualizacao();
    await buscarListarAlunos();

  } catch (erro) {
    console.error("Falha ao atualizar aluno:", erro);
    alert(`Erro ao atualizar aluno: ${erro.message}`);
  }
}

// esconder formulário de edição
function esconderFormularioAtualizacao() {
  formularioAtualizacao.classList.add("hidden");
  inputAtualizacaoId.value = '';
  inputNomeAtualizacao.value = '';
  inputCPFAtualizacao.value = '';
}

// mostrar formulário de edição
function exibirFormularioAtualizacao(id, nome, cpf) {
  try {
    console.log("Mostrando formulário de atualização para o aluno ID:", id);
    inputAtualizacaoId.value = id;
    inputNomeAtualizacao.value = nome;
    inputCPFAtualizacao.value = cpf;
    formularioAtualizacao.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    console.error("Erro ao carregar aluno para edição:", erro);
    alert(`Erro ao editar aluno: ${erro.message}`);
  }
}

// excluir
async function excluirAluno(id) {
  const aluno = await fetch(`${baseUrl}/${id}`).then(res => res.json());

  if (!confirm(`Tem certeza que deseja excluir o aluno ${aluno.nome} com ID ${id}? Esta ação não pode ser desfeita.`)) {
    console.log("Exclusão cancelada pelo usuário.");
    return;
  }

  try {
    const respostaHttp = await fetch(`${baseUrl}/${id}`, {
      method: 'DELETE'
    });

    const resultadoApi = await respostaHttp.json();

    if (!respostaHttp.ok) {
      throw new Error(resultadoApi.mensagem || `Erro ao excluir aluno: ${respostaHttp.status}`);
    }

    console.log("Aluno excluído com sucesso!", id);
    alert(resultadoApi.mensagem);
    await buscarListarAlunos();

  } catch (erro) {
    console.error("Falha ao excluir aluno:", erro);
    alert(`Erro ao excluir aluno: ${erro.message}`);
  }
}

// alterar status
async function alterarStatus(id) {
  try {
    const respostaAluno = await fetch(`${baseUrl}/${id}`);
    if (!respostaAluno.ok) throw new Error("Aluno não encontrado.");

    const aluno = await respostaAluno.json();
    const novoStatus = aluno.status === true ? false : true;

    const response = await fetch(`${baseUrl}/status/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: novoStatus })
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.mensagem || `Erro ao alterar status: ${response.status}`);
    }

    alert(`Status alterado para: ${novoStatus ? 'ativo' : 'inativo'}.`);
    buscarListarAlunos();

  } catch (erro) {
    console.error("Erro ao alterar status:", erro);
    alert(`Erro ao alterar status: ${erro.message}`);
  }
}

async function aplicarFiltros() {
  try {
    const resposta = await fetch(lista_todos);
    const todosAlunos = await resposta.json();

    const termoBusca = searchInput.value.trim().toLowerCase();
    const statusSelecionado = statusFilter.value;

    let alunosFiltrados = todosAlunos;

    // Filtro por nome
    if (termoBusca) {
      alunosFiltrados = alunosFiltrados.filter(aluno =>
        aluno.nome.toLowerCase().includes(termoBusca)
      );
    }

    // Filtro por status
    if (statusSelecionado !== "all") {
      const statusBool = statusSelecionado === "active";
      alunosFiltrados = alunosFiltrados.filter(aluno =>
        aluno.status === statusBool
      );
    }

    exibirAlunosNaTela(alunosFiltrados);

  } catch (erro) {
    console.error("Erro ao aplicar filtros:", erro);
    listaAlunos.innerHTML = `<p class="text-red-500">Erro ao carregar alunos filtrados.</p>`;
  }
}

// eventos
formularioCriacao.addEventListener("submit", adicionarAluno);
formularioAtualizacao.addEventListener('submit', atualizarAluno);
botaoCancelarAtualizacao.addEventListener('click', esconderFormularioAtualizacao);
searchInput.addEventListener("input", aplicarFiltros);
statusFilter.addEventListener("change", aplicarFiltros);


// inicialização
buscarListarAlunos();
