const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');
const xlsx = require('node-xlsx');
const inquirer = require('inquirer');
const workSheetsFromFile = xlsx.parse(`${__dirname}/movimentacoes.xlsx`); //nome do arquivo baixado na b3 excel
const linhas = workSheetsFromFile[0].data;
const spinner = ora();

(async () => {
  console.log(chalk.red(boxen('Movimentação B3', { title: 'by liminha', borderStyle: 'double', titleAlignment: 'center', padding: 1 })));

  let perguntas1 = [];
  let perguntas2 = [];

  function adicionaListaDeMovimentacoesParaEscolha() {
    const movimentacoes = [];
    
    linhas.forEach((linha) => {
      if (!movimentacoes.includes(linha[2])) {
        movimentacoes.push(linha[2]);
      }
    });

    perguntas1.push({
      type: 'list',
      name: 'tipoMovimentacaoSelecionado',
      message: 'Qual tipo de movimentação?',
      choices: movimentacoes,
      default: '',
    });

    spinner.succeed('Lista de movimentações gerada com sucesso');
  };

  function adicionaListaDeAtivosParaEscolha(linhasTipoMovimentacaoSelecionado) {
    const ativos = [];
    
    linhasTipoMovimentacaoSelecionado.forEach((linha) => {
      if (!ativos.includes(linha[3].substr(0,4))) {
        ativos.push(linha[3]);
      }
    });

    perguntas2.push(
      {
        type: 'list',
        name: 'ativoSelecionado',
        message: 'Qual ativo?',
        choices: ativos,
        default: '',
      }
    );

    spinner.succeed('Lista de ativos gerada com sucesso');
  };

  function somaTotalMovimentacoes(tipoMovimentacao, ativo) {
    const linhasDeAcordoComMovimentacaoSelecoinada = linhas.filter((linha) => linha[2] === tipoMovimentacao);
    const linhasAtivo = linhasDeAcordoComMovimentacaoSelecoinada.filter(linha => linha[3].includes(ativo.substr(0,4)));

    const soma = linhasAtivo.reduce((acc, linha) => (
      acc += linha[7]
    ), 0);
  
    return soma.toFixed(2);
  }
  
  adicionaListaDeMovimentacoesParaEscolha();

  const {
    tipoMovimentacaoSelecionado,
  } = await inquirer.prompt(perguntas1);

  
  const linhasTipoMovimentacaoSelecionado = linhas.filter((linha) => linha[2] === tipoMovimentacaoSelecionado);
  
  adicionaListaDeAtivosParaEscolha(linhasTipoMovimentacaoSelecionado);

  const {
    ativoSelecionado,
  } = await inquirer.prompt(perguntas2);

  spinner.succeed('Dados gerados com sucesso ;)');

  console.log(chalk.green(boxen(`Valor: R$ ${somaTotalMovimentacoes(tipoMovimentacaoSelecionado, ativoSelecionado)}`, {padding: 1})));
})();