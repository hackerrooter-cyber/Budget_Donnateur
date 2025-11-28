(function(){
  'use strict';

  var STORAGE_KEY = 'donorBudget_value';
  var STORAGE_CUR = 'donorBudget_currency';
  var STORAGE_SAR_XOF = 'taux_SAR_XOF';
  var STORAGE_USD_SAR = 'taux_USD_SAR';
  var STORAGE_TRANCHES = 'donorTranches';
  var STORAGE_DISPLAY_CUR = 'donorDisplay_currency';
  var STORAGE_BUDGETS = 'donorBudgets';
  var STORAGE_BUDGET_NAME = 'donorBudget_name';
  var STORAGE_TAUX_LAST = 'taux_last_update';
  var STORAGE_NONUSABLE = 'donorBudget_nonusable';
  var ALLOWED_DEVISES = ['SAR','XOF'];

  var COUNTRY_CITIES = {
    "Afrique du Sud": ["Johannesburg","Pretoria","Le Cap"],
    "Algerie": ["Alger","Oran","Constantine"],
    "Angola": ["Luanda","Huambo","Lubango"],
    "Benin": ["Cotonou","Porto-Novo","Parakou"],
    "Botswana": ["Gaborone","Francistown","Maun"],
    "Burkina Faso": ["Ouagadougou","Bobo-Dioulasso","Koudougou"],
    "Burundi": ["Bujumbura","Gitega","Ngozi"],
    "Cabo Verde": ["Praia","Mindelo","Santa Maria"],
    "Cameroun": ["Yaounde","Douala","Garoua"],
    "Comores": ["Moroni","Mutsamudu","Fomboni"],
    "Congo": ["Brazzaville","Pointe-Noire","Dolisie"],
    "Cote d'Ivoire": ["Abidjan","Yamoussoukro","Bouake"],
    "Djibouti": ["Djibouti","Ali Sabieh","Tadjourah"],
    "Egypte": ["Le Caire","Alexandrie","Gizeh"],
    "Erythree": ["Asmara","Keren","Massawa"],
    "Eswatini": ["Mbabane","Manzini","Lobamba"],
    "Ethiopie": ["Addis-Abeba","Mekele","Gondar"],
    "Gabon": ["Libreville","Port-Gentil","Franceville"],
    "Gambie": ["Banjul","Serekunda","Brikama"],
    "Ghana": ["Accra","Kumasi","Tamale"],
    "Guinee": ["Conakry","Kankan","Nzerekore"],
    "Guinee Equatoriale": ["Malabo","Bata","Ebebiyin"],
    "Guinee-Bissau": ["Bissau","Bafata","Gabu"],
    "Kenya": ["Nairobi","Mombasa","Kisumu"],
    "Lesotho": ["Maseru","Teyateyaneng","Mafeteng"],
    "Liberia": ["Monrovia","Gbarnga","Ganta"],
    "Libye": ["Tripoli","Benghazi","Misrata"],
    "Madagascar": ["Antananarivo","Toamasina","Antsirabe"],
    "Malawi": ["Lilongwe","Blantyre","Mzuzu"],
    "Mali": ["Bamako","Sikasso","Segou"],
    "Maroc": ["Rabat","Casablanca","Marrakech"],
    "Maurice": ["Port-Louis","Beau Bassin","Curepipe"],
    "Mauritanie": ["Nouakchott","Nouadhibou","Kiffa"],
    "Mozambique": ["Maputo","Beira","Nampula"],
    "Namibie": ["Windhoek","Walvis Bay","Swakopmund"],
    "Niger": ["Niamey","Maradi","Agadez"],
    "Nigeria": ["Abuja","Lagos","Kano"],
    "Ouganda": ["Kampala","Gulu","Entebbe"],
    "RDC": ["Kinshasa","Lubumbashi","Goma"],
    "Rwanda": ["Kigali","Butare","Gisenyi"],
    "Sao Tome-et-Principe": ["Sao Tome","Santana","Neves"],
    "Senegal": ["Dakar","Thies","Saint-Louis"],
    "Seychelles": ["Victoria","Anse Boileau","Beau Vallon"],
    "Sierra Leone": ["Freetown","Bo","Kenema"],
    "Somalie": ["Mogadiscio","Hargeisa","Bosaso"],
    "Soudan": ["Khartoum","Omdurman","Port-Soudan"],
    "Soudan du Sud": ["Juba","Wau","Malakal"],
    "Tanzanie": ["Dodoma","Dar es Salam","Arusha"],
    "Tchad": ["N'Djamena","Moundou","Sarh"],
    "Togo": ["Lome","Sokode","Kara"],
    "Tunisie": ["Tunis","Sfax","Sousse"],
    "Zambie": ["Lusaka","Ndola","Kitwe"],
    "Zimbabwe": ["Harare","Bulawayo","Mutare"],
    "Rep Centrafricaine": ["Bangui","Bimbo","Berberati"],
    "Sahara Occidental": ["Laayoune","Dakhla","Es-Semara"]
  };

  var COUNTRIES = Object.keys(COUNTRY_CITIES).sort();

  var $ = function(selector){ return document.querySelector(selector); };
  function formatMoney(v){ return Number(v || 0).toLocaleString('fr-FR'); }

  var memoryStore = {};
  var storage = {
    get: function(key){
      try{ if(window.localStorage) return localStorage.getItem(key); }
      catch(err){}
      return memoryStore[key];
    },
    set: function(key,val){
      try{ if(window.localStorage) return localStorage.setItem(key, val); }
      catch(err){}
      memoryStore[key] = String(val);
    },
    remove: function(key){
      try{ if(window.localStorage) localStorage.removeItem(key); }
      catch(err){}
      delete memoryStore[key];
    }
  };

  function getTauxSAR_XOF(){ return Number(storage.get(STORAGE_SAR_XOF) || 157.5); }
  function getTauxUSD_SAR(){ return Number(storage.get(STORAGE_USD_SAR) || 4); }
  function setTauxSAR_XOF(v){ storage.set(STORAGE_SAR_XOF, v); }
  function setTauxUSD_SAR(v){ storage.set(STORAGE_USD_SAR, v); }

  function convert(amount, from, to){
    amount = Number(amount);
    var sarXof = getTauxSAR_XOF();
    var usdSar = getTauxUSD_SAR();
    var inXof;
    if(from === 'XOF') inXof = amount;
    else if(from === 'SAR') inXof = amount * sarXof;
    else if(from === 'USD') inXof = amount * usdSar * sarXof;
    else return 0;

    if(to === 'XOF') return inXof;
    if(to === 'SAR') return inXof / sarXof;
    if(to === 'USD') return inXof / (sarXof * usdSar);
    return 0;
  }

  function normalizeDevise(v){
    var upper = (v || '').toUpperCase();
    for(var i=0;i<ALLOWED_DEVISES.length;i++){
      if(ALLOWED_DEVISES[i] === upper) return upper;
    }
    return 'SAR';
  }

  function isValidDateInput(value){
    if(!value) return false;
    var parts = value.split('-');
    if(parts.length !== 3) return false;
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var d = Number(parts[2]);
    var date = new Date(y, (m || 1) - 1, d || 1);
    if(date.getFullYear() !== y || date.getMonth() !== (m-1) || date.getDate() !== d) return false;
    var today = new Date();
    today.setHours(0,0,0,0);
    return date.getTime() <= today.getTime();
  }

  function todayAsInput(){ return new Date().toISOString().slice(0,10); }

  function loadTranches(){ try { return JSON.parse(storage.get(STORAGE_TRANCHES) || '[]'); } catch(e){ return []; } }
  function saveTranches(arr){ storage.set(STORAGE_TRANCHES, JSON.stringify(arr)); }
  function loadBudgets(){ try { return JSON.parse(storage.get(STORAGE_BUDGETS) || '[]'); } catch(e){ return []; } }
  function saveBudgets(arr){ storage.set(STORAGE_BUDGETS, JSON.stringify(arr)); }
  function getBudgetName(){ return storage.get(STORAGE_BUDGET_NAME) || ''; }
  function getNonUsable(){ return Number(storage.get(STORAGE_NONUSABLE) || 0); }
  function setNonUsable(v){ storage.set(STORAGE_NONUSABLE, Math.max(0, Number(v) || 0)); }

  function askBudget(){
    var deviseSelectEl = document.getElementById('deviseSelect');
    var baseCur = deviseSelectEl ? deviseSelectEl.value : 'SAR';
    var def = storage.get(STORAGE_KEY) || '';
    var saisie = prompt('Entrez votre budget en ' + baseCur + ' :', def);
    if(saisie === null) return null;
    saisie = saisie.replace(/\s+/g,'').replace(',','.');
    if(isNaN(Number(saisie))){
      alert('Valeur non valide');
      return askBudget();
    }
    storage.set(STORAGE_KEY, Number(saisie));
    storage.set(STORAGE_CUR, baseCur);

    var title = getBudgetName();
    if(title && title.trim()){
      var budgets = loadBudgets();
      budgets.push({
        title: title.trim(),
        montant: Number(saisie),
        devise: baseCur,
        date: todayAsInput(),
        tranches: loadTranches(),
        nonUsable: getNonUsable()
      });
      saveBudgets(budgets.slice(-10));
    }
    return Number(saisie);
  }

  function updateDisplay(){
    var badgeEl = document.getElementById('displayBadge');
    var deviseSelectEl = document.getElementById('deviseSelect');
    var v = storage.get(STORAGE_KEY);
    var c = storage.get(STORAGE_CUR);
    var displayCur = deviseSelectEl ? deviseSelectEl.value : 'SAR';

    if(!v || !c){
      var r = askBudget();
      if(r !== null) updateDisplay();
      return;
    }

    var converted = convert(Number(v), c, displayCur);
    if(badgeEl){
      badgeEl.textContent = formatMoney(converted) + ' ' + displayCur;
      badgeEl.style.display = 'inline-flex';
    }
  }

  function init(){
    try{
      var btn = $('#btnBudget');
      var badge = $('#displayBadge');
      var deviseSelect = $('#deviseSelect');
      var changer = $('#changer');
      var reinit = $('#reinitialiser');
      var tauxSARInput = $('#tauxXOF_SAR');
      var saveTauxBtn = $('#saveTaux');
      var refreshTauxBtn = $('#refreshTaux');
      var btnNewBudget = $('#btnNewBudget');
      var budgetSelect = $('#budgetSelect');
      var budgetAction = $('#budgetAction');
      var addTrancheBtn = $('#addTranche');
      var nonUsableInput = $('#nonUsableInput');
      var saveNonUsableBtn = $('#saveNonUsable');
      var availableBadge = $('#availableBadge');
      var tranchesTable = $('#tranchesTable');
      var totalTranchesStat = $('#totalTranchesStat');
      var totalTranchesFoot = $('#totalTranchesFoot');
      var dialog = $('#trancheDialog');
      var closeDialogBtn = $('#closeDialog');
      var cancelDialogBtn = $('#cancelDialog');
      var trancheForm = $('#trancheForm');
      var dateInput = $('#dateInput');
      var montantInput = $('#montantInput');
      var deviseInput = $('#deviseInput');
      var projetInput = $('#projetInput');
      var paysInput = $('#paysInput');
      var villeInput = $('#villeInput');
      var localisationInput = $('#localisationInput');

      if(!btn || !badge || !deviseSelect){
        console.warn('Elements essentiels manquants - verifie le HTML.');
        return;
      }

      var savedDisplayCur = normalizeDevise(storage.get(STORAGE_DISPLAY_CUR) || 'SAR');
      deviseSelect.value = savedDisplayCur;
      if(tauxSARInput) tauxSARInput.value = getTauxSAR_XOF();
      if(nonUsableInput) nonUsableInput.value = getNonUsable();

      var editingIndex = null;

      function applyDateGuard(){
        if(dateInput) dateInput.max = todayAsInput();
      }

      function populateCountryOptions(selected){
        if(!paysInput) return;
        paysInput.innerHTML = '<option value="" disabled'+(selected ? '' : ' selected')+'>Choisir un pays africain</option>';
        for(var i=0;i<COUNTRIES.length;i++){
          var c = COUNTRIES[i];
          var opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          if(selected === c) opt.selected = true;
          paysInput.appendChild(opt);
        }
        var other = document.createElement('option');
        other.value = 'Autre';
        other.textContent = 'Autre';
        if(selected === 'Autre') other.selected = true;
        paysInput.appendChild(other);
      }

      function populateCityOptions(country, selected){
        if(!villeInput) return;
        villeInput.innerHTML = '<option value="" disabled'+(selected ? '' : ' selected')+'>Choisir une ville</option>';
        var cities = COUNTRY_CITIES[country] || [];
        var seen = {};
        for(var i=0;i<cities.length;i++) seen[cities[i]] = true;
        if(selected && !seen[selected]) cities.push(selected);
        cities.push('Autre');
        for(var j=0;j<cities.length;j++){
          var city = cities[j];
          var opt = document.createElement('option');
          opt.value = city;
          opt.textContent = city;
          if(selected === city) opt.selected = true;
          villeInput.appendChild(opt);
        }
      }

      function renderTranches(){
        if(!tranchesTable) return;
        var data = loadTranches();
        tranchesTable.innerHTML = '';
        var total = 0;
        var displayCur = deviseSelect.value;
        for(var i=0;i<data.length;i++){
          var t = data[i];
          var rowDevise = normalizeDevise(t.devise || (storage.get(STORAGE_CUR) || displayCur));
          total += convert(t.montant, rowDevise, displayCur);
          var tr = document.createElement('tr');
          var row = '';
          row += '<td>'+(i+1)+'</td>';
          row += '<td>'+(t.pays || 'Pays non precise')+'</td>';
          row += '<td>'+(t.ville || 'Ville non precisee')+'</td>';
          row += '<td>'+(t.projet || 'Projet non precise')+'</td>';
          row += '<td>'+(t.date || '')+'</td>';
          row += '<td>'+formatMoney(t.montant)+' '+rowDevise+'</td>';
          row += '<td>'+formatMoney(convert(t.montant, rowDevise, 'XOF'))+' XOF</td>';
          row += '<td>'+(t.localisation || '-')+'</td>';
          row += '<td>1 SAR='+(t.tauxSAR_XOF || getTauxSAR_XOF())+' XOF</td>';
          row += '<td class="table-actions">';
          row += '<button onclick="editTranche('+i+')" aria-label="Modifier la tranche '+(i+1)+'">Modifier</button>';
          row += '<button class="delete" onclick="deleteTranche('+i+')" aria-label="Supprimer la tranche '+(i+1)+'">Supprimer</button>';
          row += '</td>';
          tr.innerHTML = row;
          tranchesTable.appendChild(tr);
        }
        if(totalTranchesStat) totalTranchesStat.textContent = formatMoney(total) + ' ' + displayCur;
        if(totalTranchesFoot) totalTranchesFoot.textContent = formatMoney(total) + ' ' + displayCur;
      }

      function openDialog(tranche, index){
        if(!dialog) return;
        dialog.hidden = false;
        dialog.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        editingIndex = (typeof index === 'number') ? index : null;
        $('#dialogTitle').textContent = editingIndex === null ? 'Ajouter une tranche' : 'Modifier la tranche';
        dateInput.value = tranche && tranche.date ? tranche.date : todayAsInput();
        montantInput.value = (tranche && typeof tranche.montant !== 'undefined') ? tranche.montant : '';
        deviseInput.value = normalizeDevise(tranche && tranche.devise ? tranche.devise : deviseSelect.value);
        projetInput.value = tranche && tranche.projet ? tranche.projet : '';
        var paysVal = tranche && tranche.pays ? tranche.pays : '';
        populateCountryOptions(paysVal);
        populateCityOptions(paysVal || '', tranche && tranche.ville ? tranche.ville : '');
        if(paysInput) paysInput.value = paysVal || '';
        if(villeInput) villeInput.value = tranche && tranche.ville ? tranche.ville : '';
        localisationInput.value = tranche && tranche.localisation ? tranche.localisation : '';
        applyDateGuard();
      }

      function closeDialog(){
        if(!dialog) return;
        dialog.hidden = true;
        dialog.classList.remove('is-open');
        document.body.style.overflow = '';
        trancheForm.reset();
        editingIndex = null;
        if(addTrancheBtn) addTrancheBtn.focus();
      }

      function addTrancheFlow(){
        var current = loadTranches();
        if(current.length >= 5){
          alert('Maximum 5 tranches !');
          return;
        }
        openDialog();
      }

      function promptTauxUpdate(){
        var current = getTauxSAR_XOF();
        var saisie = prompt('Taux SAR -> XOF actuel : '+current+'\nEntrer le nouveau taux SAR -> XOF :', current);
        if(saisie === null) return;
        saisie = saisie.replace(/\s+/g,'').replace(',','.');
        var num = Number(saisie);
        if(!isFinite(num) || num <= 0){
          alert('Taux invalide');
          return;
        }
        setTauxSAR_XOF(num);
        storage.set(STORAGE_TAUX_LAST, todayAsInput());
        if(tauxSARInput) tauxSARInput.value = num;
        renderTranches();
        updateDisplay();
        updateReste();
        alert('Taux mis a jour.');
      }

      async function fetchTauxWise(){
        var target = 'https://wise.com/fr/currency-converter/sar-to-xof-rate';
        var proxyBase = 'http://localhost:8080/';
        var url = proxyBase + target;
        try{
          var resp = await fetch(url, { mode: 'cors' });
          if(!resp.ok) throw new Error('HTTP ' + resp.status);
          var html = await resp.text();
          var rateStr = null;
          var m1 = html.match(/data-qa="exchange-rate"[^>]*>([0-9.,\s]+)</i);
          if(m1) rateStr = m1[1];
          if(!rateStr){
            var m2 = html.match(/"value"\s*:\s*"([0-9.,]+)"/);
            if(m2) rateStr = m2[1];
          }
          if(!rateStr) throw new Error('Taux introuvable sur la page Wise');
          var taux = Number(rateStr.replace(/\s+/g,'').replace(',','.'));
          if(!isFinite(taux) || taux <= 0) throw new Error('Taux invalide : ' + rateStr);
          setTauxSAR_XOF(taux);
          storage.set(STORAGE_TAUX_LAST, todayAsInput());
          if(typeof tauxSARInput !== 'undefined' && tauxSARInput) tauxSARInput.value = taux;
          renderTranches();
          updateDisplay();
          updateReste();
          alert('Taux SAR->XOF mis a jour (Wise) : ' + taux);
        }catch(err){
          console.error('Erreur mise a jour taux Wise', err);
          alert('Impossible de recuperer le taux (CORS/acces).');
        }
      }

      function refreshBudgetOptions(){
        if(!budgetSelect) return;
        var budgets = loadBudgets().filter(function(b){ return b && b.title && b.title.trim(); });
        var currentName = getBudgetName();
        budgetSelect.innerHTML = '<option value="">Budgets enregistres</option>';
        budgets.forEach(function(b, idx){
          var opt = document.createElement('option');
          opt.value = idx;
          opt.textContent = b.title.trim();
          if(currentName && b.title && b.title.trim() === currentName) opt.selected = true;
          budgetSelect.appendChild(opt);
        });
      }

      function updateReste(){
        var budget = Number(storage.get(STORAGE_KEY) || 0);
        var budgetCur = storage.get(STORAGE_CUR) || deviseSelect.value;
        var nonUsable = getNonUsable();
        var budgetNet = Math.max(0, budget - nonUsable);
        var data = loadTranches();
        var total = 0;
        for(var i=0;i<data.length;i++){
          var t = data[i];
          var trancheDevise = normalizeDevise(t.devise || budgetCur);
          total += convert(t.montant, trancheDevise, budgetCur);
        }
        var reste = budgetNet - total;
        var el = document.getElementById('resteBudget');
        var displayCur = deviseSelect.value;
        var resteAffiche = convert(reste, budgetCur, displayCur);
        var dispoAffiche = convert(budgetNet, budgetCur, displayCur);
        if(el) el.textContent = formatMoney(resteAffiche) + ' ' + displayCur;
        if(availableBadge) availableBadge.textContent = formatMoney(dispoAffiche) + ' ' + displayCur;
      }

      refreshBudgetOptions();

      if(budgetSelect){
        budgetSelect.addEventListener('change', function(){
          var idx = parseInt(budgetSelect.value, 10);
          if(isNaN(idx)) return;
          var budgets = loadBudgets().filter(function(b){ return b && b.title && b.title.trim(); });
          var selected = budgets[idx];
          if(!selected) return;
          storage.set(STORAGE_BUDGET_NAME, selected.title || '');
          storage.set(STORAGE_KEY, selected.montant);
          storage.set(STORAGE_CUR, selected.devise || 'SAR');
          setNonUsable(selected.nonUsable || 0);
          if(nonUsableInput) nonUsableInput.value = getNonUsable();
          saveTranches(selected.tranches || []);
          updateDisplay();
          renderTranches();
          updateReste();
        });
      }

      if(budgetAction){
        budgetAction.addEventListener('change', function(){
          var action = budgetAction.value;
          budgetAction.value = '';
          if(!action) return;

          var idx = budgetSelect ? parseInt(budgetSelect.value, 10) : NaN;
          var budgets = loadBudgets().filter(function(b){ return b && b.title && b.title.trim(); });
          var selected = (!isNaN(idx) && budgets[idx]) ? budgets[idx] : null;

          if(action === 'modifier'){
            var newName = prompt('Nom du budget :', getBudgetName() || (selected ? selected.title : ''));
            if(newName && newName.trim()) storage.set(STORAGE_BUDGET_NAME, newName.trim());
            var r = askBudget();
            if(r !== null) updateDisplay();
            var updated = loadBudgets().filter(function(b){ return b && b.title && b.title.trim(); });
            updated.push({
              title: getBudgetName() || '',
              montant: Number(storage.get(STORAGE_KEY) || 0),
              devise: storage.get(STORAGE_CUR) || 'SAR',
              date: todayAsInput(),
              tranches: loadTranches(),
              nonUsable: getNonUsable()
            });
            saveBudgets(updated.slice(-10));
            refreshBudgetOptions();
          } else if(action === 'supprimer'){
            if(confirm('Supprimer le budget et toutes les tranches ?')){
              if(selected){
                budgets.splice(idx,1);
                saveBudgets(budgets);
              }
              storage.remove(STORAGE_KEY);
              storage.remove(STORAGE_CUR);
              storage.remove(STORAGE_TRANCHES);
              storage.remove(STORAGE_BUDGET_NAME);
              storage.remove(STORAGE_NONUSABLE);
              if(badge) badge.style.display = 'none';
              renderTranches();
              updateReste();
              refreshBudgetOptions();
              alert('Budget et tranches supprimes.');
            }
          }
        });
      }

      if(addTrancheBtn) addTrancheBtn.addEventListener('click', addTrancheFlow);
      if(closeDialogBtn) closeDialogBtn.addEventListener('click', function(e){ e.preventDefault(); closeDialog(); });
      if(cancelDialogBtn) cancelDialogBtn.addEventListener('click', function(e){ e.preventDefault(); closeDialog(); });

      if(btn){
        btn.addEventListener('click', function(){
          try{
            var v = storage.get(STORAGE_KEY);
            if(!v){
              var r = askBudget();
              if(r !== null) updateDisplay();
            } else {
              updateDisplay();
            }
          }catch(e){
            alert('Erreur lors du clic Afficher : ' + (e && e.message ? e.message : e));
            console.error(e);
          }
        });
      }

      if(btnNewBudget){
        btnNewBudget.addEventListener('click', function(){
          var name = prompt('Nom du nouveau budget : ', getBudgetName() || '');
          if(name === null || !name.trim()){
            alert('Nom du budget requis.');
            return;
          }
          var baseCur = deviseSelect.value;
          var amount = prompt('Montant du budget en '+baseCur+' : ','');
          if(amount === null) return;
          amount = amount.replace(/\s+/g,'').replace(',','.');
          if(isNaN(Number(amount)) || Number(amount) <= 0){
            alert('Montant invalide.');
            return;
          }
          storage.remove(STORAGE_KEY);
          storage.remove(STORAGE_CUR);
          storage.remove(STORAGE_TRANCHES);
          storage.set(STORAGE_BUDGET_NAME, name.trim());
          setNonUsable(0);
          if(nonUsableInput) nonUsableInput.value = '0';
          if(badge) badge.style.display = 'none';
          renderTranches();
          updateReste();
          var budgets = loadBudgets();
          budgets.push({
            title: name.trim(),
            montant: Number(amount),
            devise: baseCur,
            date: todayAsInput(),
            tranches: [],
            nonUsable: 0
          });
          saveBudgets(budgets.slice(-10));
          refreshBudgetOptions();
          storage.set(STORAGE_KEY, Number(amount));
          storage.set(STORAGE_CUR, baseCur);
          updateDisplay();
          updateReste();
        });
      }

      if(changer) changer.addEventListener('click', function(e){ e.preventDefault(); var r = askBudget(); if(r !== null) updateDisplay(); });
      if(reinit) reinit.addEventListener('click', function(e){ e.preventDefault(); if(confirm('Supprimer le budget ?')){ storage.remove(STORAGE_KEY); storage.remove(STORAGE_CUR); if(badge) badge.style.display='none'; } });
      deviseSelect.addEventListener('change', function(){
        storage.set(STORAGE_DISPLAY_CUR, deviseSelect.value);
        updateDisplay();
        renderTranches();
        updateReste();
      });

      if(saveTauxBtn){
        saveTauxBtn.addEventListener('click', function(){
          var vSAR = Number(tauxSARInput.value);
          if(vSAR > 0) setTauxSAR_XOF(vSAR);
          storage.set(STORAGE_TAUX_LAST, todayAsInput());
          renderTranches();
          updateDisplay();
          alert('Taux enregistres !');
        });
      }

      if(saveNonUsableBtn){
        saveNonUsableBtn.addEventListener('click', function(){
          var v = Number((nonUsableInput && nonUsableInput.value || '').toString().replace(/\\s+/g,'').replace(',','.'));
          if(!isFinite(v) || v < 0){ alert('Montant non utilisable invalide'); return; }
          setNonUsable(v);
          updateReste();
        });
      }

      if(refreshTauxBtn){
        refreshTauxBtn.addEventListener('click', function(){ fetchTauxWise(); });
      }

      if(dialog){
        dialog.addEventListener('click', function(e){ if(e.target === dialog) closeDialog(); });
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !dialog.hidden) closeDialog(); });
      }

      if(trancheForm){
        trancheForm.addEventListener('submit', function(e){
          e.preventDefault();
          var dateVal = (dateInput.value || '').trim();
          var montantVal = Number((montantInput.value || '').toString().replace(/\s+/g,'').replace(',','.'));
          var deviseVal = normalizeDevise(deviseInput.value);
          var projetVal = (projetInput.value || '').trim();
          var paysVal = paysInput ? (paysInput.value || '') : '';
          var villeVal = (villeInput.value || '').trim();
          var localisationVal = (localisationInput.value || '').trim();

          if(!isValidDateInput(dateVal)){
            alert('Merci de saisir une date valide qui ne depasse pas la date du jour.');
            return;
          }
          if(!projetVal || !paysVal || !villeVal){
            alert('Le nom du projet, le pays et la ville sont obligatoires.');
            return;
          }
          if(!isFinite(montantVal) || montantVal <= 0){
            alert('Le montant doit etre positif.');
            return;
          }

          var arr = loadTranches();
          var payload = {
            date: dateVal,
            montant: montantVal,
            devise: deviseVal,
            projet: projetVal,
            pays: paysVal,
            ville: villeVal,
            localisation: localisationVal,
            tauxSAR_XOF: getTauxSAR_XOF(),
            tauxUSD_SAR: getTauxUSD_SAR()
          };

          if(typeof editingIndex === 'number') arr[editingIndex] = payload;
          else arr.push(payload);

          saveTranches(arr);
          renderTranches();
          updateReste();
          closeDialog();
        });
      }

      var exportBtn = document.getElementById('exportCSV');
      if(exportBtn){
        exportBtn.addEventListener('click', function(){
          var data = loadTranches();
          var csv = 'N°,Pays,Ville,Projet,Date,Montant,Devise,Localisation\n';
          for(var i=0;i<data.length;i++){
            var t = data[i];
            csv += (i+1)+','+(t.pays || '')+','+(t.ville || '')+','+(t.projet || '')+','+(t.date || '')+','+(t.montant || 0)+','+normalizeDevise(t.devise || deviseSelect.value)+','+(t.localisation || '')+'\n';
          }
          var blob = new Blob([csv], {type:'text/csv'});
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'tranches.csv';
          a.click();
          URL.revokeObjectURL(url);
        });
      }

      var exportPdfBtn = document.getElementById('exportPDF');
      if(exportPdfBtn){
        exportPdfBtn.addEventListener('click', function(){
          var data = loadTranches();
          var displayCur = deviseSelect.value;
          var totalDisplay = 0;
          for(var i=0;i<data.length;i++){
            var t = data[i];
            var rowDevise = normalizeDevise(t.devise || displayCur);
            totalDisplay += convert(t.montant, rowDevise, displayCur);
          }
          var rows = '';
          for(var j=0;j<data.length;j++){
            var rt = data[j];
            var rd = normalizeDevise(rt.devise || displayCur);
            rows += '<tr><td>'+(j+1)+'</td><td>'+(rt.pays || 'Pays non precise')+'</td><td>'+(rt.ville || 'Ville non precisee')+'</td><td>'+(rt.projet || 'Projet non precise')+'</td><td>'+(rt.date || '')+'</td><td>'+formatMoney(convert(rt.montant, rd, displayCur))+' '+displayCur+'</td><td>'+formatMoney(convert(rt.montant, rd, 'XOF'))+' XOF</td><td>'+(rt.localisation || '-')+'</td><td>1 SAR='+(rt.tauxSAR_XOF || getTauxSAR_XOF())+' XOF</td></tr>';
          }
          var content = "<!doctype html>"+
            "<html><head><meta charset=\"utf-8\"><title>Historique des tranches</title>"+
            "<style>body{font-family:Arial,sans-serif;padding:20px;color:#0b1220;}h1{margin-top:0;}table{border-collapse:collapse;width:100%;margin-top:16px;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}th{background:#f5f5f5;}tfoot td{font-weight:bold;background:#eef3f8;}</style></head><body>"+
            "<h1>Historique des tranches</h1>"+
            "<p>Devise d&#39;affichage : "+displayCur+"</p>"+
            "<table><thead><tr><th>N°</th><th>Pays</th><th>Ville</th><th>Projet</th><th>Date</th><th>Montant</th><th>Montant XOF</th><th>Localisation</th><th>Taux utilises</th></tr></thead><tbody>"+
            rows+
            "</tbody><tfoot><tr><td colspan=\"6\">Total</td><td colspan=\"3\">"+formatMoney(totalDisplay)+" "+displayCur+"</td></tr></tfoot></table>"+
            "</body></html>";

          var w = window.open('', '_blank');
          if(!w) return;
          w.document.write(content);
          w.document.close();
          w.focus();
          w.print();
        });
      }

      window.deleteTranche = function(i){
        var arr = loadTranches();
        arr.splice(i, 1);
        saveTranches(arr);
        renderTranches();
        updateReste();
      };

      window.editTranche = function(i){
        var arr = loadTranches();
        var t = arr[i];
        if(!t) return;
        openDialog(t, i);
      };

      renderTranches();
      var lastTauxUpdate = storage.get(STORAGE_TAUX_LAST) || '';
      if(lastTauxUpdate !== todayAsInput()){
        fetchTauxWise().catch(function(){ promptTauxUpdate(); });
      } else {
        updateDisplay();
        updateReste();
      }
    }catch(err){
      console.error('Erreur init', err);
      alert('Erreur initialisation : ' + (err && err.message ? err.message : err));
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
