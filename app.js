

var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        totalBudget: 0,
        percentage: -1
    };

    var calculateExpInc = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });

        return data.totals[type] = sum;
    }

    var allTotals = function(){
        return {
            totalExp: data.totals.exp,
            totalInc: data.totals.inc,
            budget: data.totalBudget,
            percentage: data.percentage
        }
    }

    return {
        addItem: function(type, desc, val){
            var newItem, ID;
            
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }

            if (type == 'exp'){
                newItem = new Expense (ID, desc, val);
            } else if (type == 'inc'){
                newItem = new Income (ID, desc, val);
            }
            
            data.allItems[type].push(newItem);

            return newItem;
            },

        deleteItem: function(type, id){
                for (i = 0; i < data.allItems[type].length; i++){
                    if (data.allItems[type][i].id == id ){
                        data.allItems[type].splice(i,1);
                        break;
                    }
                }
        },

        calculateTotals: function() {
                data.totalBudget = calculateExpInc('inc') - calculateExpInc('exp');
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
                if(isNaN(data.percentage) || !isFinite(data.percentage)){
                    data.percentage = 0;
                }
                console.log(allTotals());
            },
        allTotals: allTotals,
        data: data
    }

})();





var UIController = (function(){

    var DOMstrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        button: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budget: '.budget__value',
        income: '.budget__income--value',
        expenses: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container'
    }

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.type).value,
                description: document.querySelector(DOMstrings.description).value,
                value: parseFloat(document.querySelector(DOMstrings.value).value)
            };
        },

        getDOMstrings: function(){
            return DOMstrings;
        },

        addToListUI: function(obj, type){
            var html, list;

            // Create HTML string with placeholder text
            if(type === 'inc'){
                
                list = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>' +
                '<div class="right clearfix"><div class="item__value">$%value%</div>' +
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">'+
                '</i></button></div></div></div>';
            } else if (type === 'exp'){

                list = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="expense-%id%">' +
                '<div class="item__description">%description%</div><div class="right clearfix">' +
                '<div class="item__value">$%value%</div><div class="item__percentage">21%</div>' +
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">' +
                '</i></button></div></div></div>';

            }

            // Replace placeholders with actual data

            html = html.replace('%id%',obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', obj.value);

            // Insert HTML into DOM, clear fields, and set cursor to description
            document.querySelector(list).insertAdjacentHTML('beforeend',html);
            document.querySelector(DOMstrings.description).value = '';
            document.querySelector(DOMstrings.value).value = '';
            
            document.querySelector(DOMstrings.description).focus();
        },

        addToBudgetUI: function(obj){

            document.querySelector(DOMstrings.budget).textContent = obj.budget;
            document.querySelector(DOMstrings.income).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenses).textContent = obj.totalExp;
            document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            
        }

        };

})();





var controller = (function(bdgtCtrl, UICtrl){
    
    var setUpEventListeners = function() {
            var DOM = UICtrl.getDOMstrings();

            //Add item
            document.querySelector(DOM.button).addEventListener('click', ctrlAddItem);
            document.addEventListener('keypress', function(event){
                if (event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem();
                }
        
            })

            //Delete item
            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    var ctrlAddItem = function(){
        // 1. Get field input data
        var input = UICtrl.getInput();
        
        if(input.description !== '' && input.value > 0){

            // 2. Add item to budget controller
            var newItem = bdgtCtrl.addItem(input.type, input.description, input.value);
            
            // 3. Add item to UI
            UICtrl.addToListUI(newItem, input.type);
            
            // 4. Calculate budget
            bdgtCtrl.calculateTotals();

            // 5. Display budget in UI
            UICtrl.addToBudgetUI(bdgtCtrl.allTotals());
        }
//        console.log(bdgtCtrl.returnData());
    };

    var ctrlDeleteItem = function(event){
        var itemID;

        // 1. Define target item & Income/Expense
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        itemIncExp = itemID.substr(0,3);
        itemIDValue = parseInt(itemID.substr(itemID.search("-") + 1,itemID.length - itemID.search("-")));
        console.log(itemIDValue);
        // 2. Delete from budget controller
        bdgtCtrl.deleteItem(itemIncExp,itemIDValue);

        // 3. Delete from UI
        document.getElementById(itemID).remove();

        // 4. Calculate budget
        bdgtCtrl.calculateTotals();

        // 5. Display budget in UI
        UICtrl.addToBudgetUI(bdgtCtrl.allTotals());

    }

    return {
        init: function(){
            console.log('Application has started.');
            setUpEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();