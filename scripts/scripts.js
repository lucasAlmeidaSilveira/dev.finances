const modeDarkLight = {
    toggleOnOff(){
        let html = document.querySelector('html')
        const toggleControl = document.querySelector('#switch')

        toggleControl.checked ? html.setAttribute('data-theme', 'dark') : html.setAttribute('data-theme', 'light')
    },

    toggleHour(){
        let html = document.querySelector('html')
        let d = new Date()
        let hour = d.getHours()

        if (hour >= 19 || hour <=5){
            html.setAttribute('data-theme', 'dark')
            document.querySelector('#switch').checked = true

        } else{
            html.setAttribute('data-theme', 'light')
        }
    }
}

const modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    // Pegar as informações
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    // Guardar as informações
    set(transactions){
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
}

const Transaction = {
    // Pegando as infos do transaction
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction)
        App.reload()

    },

    remove(index){
        Transaction.all.splice(index,1)
        App.reload()
    },

    incomes(){
        let income = 0
        // pegar todas as transações
        // para cada transação,
        Transaction.all.forEach((transaction) => {
            // se for maior que zero
            if(transaction.amount > 0){
                // somar a uma variável e retornar a variável
                income += transaction.amount
            }
        })
        return income
    },

    expense(){
        let expense = 0
        // pegar todas as transações
        // para cada transação,
        Transaction.all.forEach((transaction) => {
            // se for maior que zero
            if(transaction.amount < 0){
                // somar a uma variável e retornar a variável
                expense += transaction.amount
            }
        })
        return expense
    },

    total(){

        return Transaction.incomes() + Transaction.expense()
        // entradas - saídas
    }
}

// Pegar as minhas transações do meu objeto (transactions) do JS e passar para o HTML
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    soundCoin(){
        var coin = new Audio();
        coin.src = "assets/sound/coin.mp3";
        coin.play()
    },

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const tdTable = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick='Transaction.remove(${index})' src="assets/minus.svg" alt="Remover transação">
            </td>
        `
        return tdTable
    },

    updateBalance(){

        //Entradas
        document
        .getElementById('incomesDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        //Saídas
        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expense())
        //Total
        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(value){
        // Método de retirar todas as vírgulas e pontos, e colocar espaço vazio
        value = value.replace(/\,\./g, '') * 100
        return Math.round(value)
    },

    formatDate(value){
        const splittedDate = value.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    
    formatCurrency(value){
        const signal = Number(value) < 0 ? '-' : ''

        // Transformar o value em string para habilitar a função replace
        // Remover qualquer caractere (-) que não seja um número
        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
        return signal + value 
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields(){
        const{description, amount, date} = Form.getValues()

        if(description.trim() === '' || amount.trim() === '' || date.trim() === ''){
            throw new Error('Por favor, preencha todos os campos')
        }
    },

    formatValues(){

        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    clearFields(){
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event){
        event.preventDefault()

        try {
        // verificar se todas as info foram preenchidas
        Form.validateFields()

        // formatar os dados para salvar
        const newTransaction = Form.formatValues()

        // salvar
        Transaction.add(newTransaction)
        
        // ativa o som da moeda
        DOM.soundCoin()

        // apagar os dados do formulário
        Form.clearFields()

        // modal feche
        modal.close()

        // atualizar a aplicação
        // Aqui seria necessário adicionar a function App.reload, mas não se faz necessário pois dentro da função Transaction.add já existe a função App.reload

        } catch (error) {
            console.log(error.message)
        }
        
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)

        })
        
        DOM.updateBalance()
        
        // Guardando as infos no localStorage
        Storage.set(Transaction.all)

    },
    reload(){
        DOM.clearTransactions()
        App.init()
    },

}

App.init()
// Mudando modo de acordo com a hora
modeDarkLight.toggleHour()
