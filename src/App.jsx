import React, { useState, useEffect, useRef } from "react";

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS = ["Breakfast", "Lunch", "Dinner"];

const TAGS = ["⚡ Quick", "💪 High Protein", "❄️ Freezer Friendly", "🥗 Veggie", "👶 Kid Friendly", "🍲 Batch Cook"];

const SLOT_ICONS = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" };

const INITIAL_MEALS = [
  { id: 1, name: "Spaghetti Bolognese", tags: ["👶 Kid Friendly", "❄️ Freezer Friendly"], mealTypes: ["Dinner"], cookCount: 8, ingredients: ["spaghetti", "beef mince", "tomatoes", "onion", "garlic"] },
  { id: 2, name: "Chicken Stir Fry", tags: ["⚡ Quick", "💪 High Protein"], mealTypes: ["Lunch", "Dinner"], cookCount: 5, ingredients: ["chicken breast", "mixed veg", "soy sauce", "rice", "garlic"] },
  { id: 3, name: "Overnight Oats", tags: ["⚡ Quick", "👶 Kid Friendly"], mealTypes: ["Breakfast"], cookCount: 12, ingredients: ["oats", "milk", "banana", "honey", "berries"] },
  { id: 4, name: "Sheet Pan Salmon", tags: ["💪 High Protein", "⚡ Quick"], mealTypes: ["Dinner"], cookCount: 3, ingredients: ["salmon fillets", "broccoli", "lemon", "olive oil", "garlic"] },
  { id: 5, name: "Chicken Soup", tags: ["❄️ Freezer Friendly", "🍲 Batch Cook", "👶 Kid Friendly"], mealTypes: ["Lunch", "Dinner"], cookCount: 6, ingredients: ["whole chicken", "carrots", "celery", "onion", "noodles"] },
  { id: 6, name: "Veggie Frittata", tags: ["🥗 Veggie", "⚡ Quick", "💪 High Protein"], mealTypes: ["Breakfast", "Lunch"], cookCount: 4, ingredients: ["eggs", "spinach", "feta", "cherry tomatoes", "onion"] },
  { id: 7, name: "Turkey Tacos", tags: ["⚡ Quick", "👶 Kid Friendly", "💪 High Protein"], mealTypes: ["Dinner"], cookCount: 7, ingredients: ["turkey mince", "taco shells", "cheese", "lettuce", "salsa"] },
  { id: 8, name: "Lentil Dal", tags: ["🥗 Veggie", "❄️ Freezer Friendly", "🍲 Batch Cook"], mealTypes: ["Dinner"], cookCount: 2, ingredients: ["red lentils", "coconut milk", "tomatoes", "cumin", "rice"] },
  { id: 9, name: "Scrambled Eggs & Toast", tags: ["⚡ Quick", "💪 High Protein", "👶 Kid Friendly"], mealTypes: ["Breakfast"], cookCount: 10, ingredients: ["eggs", "bread", "butter", "salt", "milk"] },
  { id: 10, name: "Avocado Toast", tags: ["⚡ Quick", "🥗 Veggie"], mealTypes: ["Breakfast"], cookCount: 6, ingredients: ["sourdough", "avocado", "lemon", "chilli flakes", "eggs"] },
  { id: 11, name: "Chicken Wrap", tags: ["⚡ Quick", "👶 Kid Friendly", "💪 High Protein"], mealTypes: ["Lunch"], cookCount: 9, ingredients: ["tortilla wraps", "chicken breast", "lettuce", "tomato", "mayo"] },
  { id: 12, name: "Greek Salad with Pitta", tags: ["🥗 Veggie", "⚡ Quick"], mealTypes: ["Lunch"], cookCount: 4, ingredients: ["cucumber", "tomatoes", "feta", "olives", "pitta bread"] },
];

const EMPTY_PLAN = () => {
  const plan = {};
  DAYS.forEach(d => { plan[d] = {}; SLOTS.forEach(s => { plan[d][s] = null; }); });
  return plan;
};

const TAG_COLORS = {
  "⚡ Quick": { bg: "#fef3c7", text: "#92400e" },
  "💪 High Protein": { bg: "#dbeafe", text: "#1e40af" },
  "❄️ Freezer Friendly": { bg: "#e0f2fe", text: "#075985" },
  "🥗 Veggie": { bg: "#dcfce7", text: "#166534" },
  "👶 Kid Friendly": { bg: "#fce7f3", text: "#9d174d" },
  "🍲 Batch Cook": { bg: "#ede9fe", text: "#5b21b6" },
};

function PlanItGrid({ item, plan, onPlan, onClose }) {
  const validSlots = item.mealTypes?.length ? SLOTS.filter(s => item.mealTypes.includes(s)) : SLOTS;

  return (
    <div className="plan-grid">
      <div className="plan-grid-title">📅 Drop into the week</div>
      <table className="plan-grid-table">
        <thead>
          <tr>
            <th></th>
            {DAYS.map(d => <th key={d}>{d.slice(0,3)}</th>)}
          </tr>
        </thead>
        <tbody>
          {validSlots.map(slot => (
            <tr key={slot}>
              <td style={{ fontSize: "10px", fontWeight: 700, color: "#8a7060", whiteSpace: "nowrap", paddingLeft: "8px", textAlign: "left" }}>
                {SLOT_ICONS[slot]}
              </td>
              {DAYS.map(day => {
                const taken = !!plan[day][slot];
                return (
                  <td key={day}>
                    <button
                      className={`plan-slot-btn ${taken ? "taken" : "empty"}`}
                      disabled={taken}
                      onClick={() => !taken && onPlan(item, day, slot)}
                      title={taken ? `${day} ${slot} is taken` : `Add to ${day} ${slot}`}
                    >
                      {taken ? "✓" : "+"}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button className="plan-grid-cancel" onClick={onClose}>close</button>
    </div>
  );
}

export default function MealPlanner() {
  const [view, setView] = useState("planner"); // planner | meals | shopping | suggest
  const [plan, setPlan] = useLocalStorage("ff_plan", EMPTY_PLAN());
  const [meals, setMeals] = useLocalStorage("ff_meals", INITIAL_MEALS);
  const [selecting, setSelecting] = useState(null); // {day, slot}
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState(null);
  const [goalFilter, setGoalFilter] = useState(null);
  const [newMeal, setNewMeal] = useState({ name: "", tags: [], mealTypes: [], ingredients: "" });
  const [addingMeal, setAddingMeal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiGoal, setAiGoal] = useState("");
  const [cookedToday, setCookedToday] = useState(null);
  const [shoppingChecked, setShoppingChecked] = useLocalStorage("ff_shoppingChecked", {});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inventory, setInventory] = useLocalStorage("ff_inventory", [
    { id: 1, name: "Leftover Spaghetti Bolognese", type: "leftover", portions: 2, addedDay: "Monday", mealTypes: ["Lunch", "Dinner"] },
    { id: 2, name: "Frozen Chicken Soup", type: "freezer", portions: 4, addedDay: null, mealTypes: ["Lunch", "Dinner"] },
  ]);
  const [newInvItem, setNewInvItem] = useState({ name: "", type: "leftover", portions: 2, mealTypes: [] });
  const [addingInv, setAddingInv] = useState(false);
  const [planningItem, setPlanningItem] = useState(null); // inventory item being planned
  const [scratchpad, setScratchpad] = useLocalStorage("ff_scratchpad", []); // queued meals for the week
  const [scratchSearch, setScratchSearch] = useState("");
  const [scratchPickerOpen, setScratchPickerOpen] = useState(false);
  const [scratchPlanningId, setScratchPlanningId] = useState(null); // which scratchpad item is showing its grid
  const [scratchNewMeal, setScratchNewMeal] = useState(null); // null | { name, mealTypes, tags, ingredients }
  const [dragging, setDragging] = useState(null); // { meal, fromDay, fromSlot }
  const [dragOver, setDragOver] = useState(null); // { day, slot }
  const dragRef = useRef(null); // reliable drag source across async events
  const [saveLeftoverPopover, setSaveLeftoverPopover] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0); // index into DAYS for mobile view
  const touchStartX = useRef(null); // { meal, day, slot, type, portions }
  const [pantryOpen, setPantryOpen] = useState(false);
  const [pantry, setPantry] = useLocalStorage("ff_pantry", [
    "olive oil", "garlic", "onion", "salt", "pepper", "butter", "eggs", "flour", "sugar", "soy sauce", "cumin", "rice"
  ]);
  const [newPantryItem, setNewPantryItem] = useState("");
  const [showPantryItems, setShowPantryItems] = useState(false);
  const [pantryShoppingItems, setPantryShoppingItems] = useLocalStorage("ff_pantryShoppingItems", []);
  const [snacksOpen, setSnacksOpen] = useState(false);
  const [snacks, setSnacks] = useLocalStorage("ff_snacks", ["Rice cakes", "Granola bars", "Apple sauce pouches", "Popcorn", "Crackers"]);
  const [newSnack, setNewSnack] = useState("");
  const [snackShoppingList, setSnackShoppingList] = useLocalStorage("ff_snackShoppingList", []);

  const saveScratchNewMeal = () => {
    if (!scratchNewMeal?.name?.trim()) return;
    const meal = {
      id: Date.now(),
      name: scratchNewMeal.name.trim(),
      mealTypes: scratchNewMeal.mealTypes || [],
      tags: scratchNewMeal.tags || [],
      cookCount: 0,
      ingredients: (scratchNewMeal.ingredients || "").split(",").map(i => i.trim()).filter(Boolean),
    };
    setMeals(prev => [...prev, meal]);
    setScratchpad(prev => [...prev, meal]);
    setScratchNewMeal(null);
    setScratchPickerOpen(false);
    setScratchSearch("");
  };

  const addToScratchpad = (meal) => {
    if (scratchpad.find(m => m.id === meal.id)) return; // no dupes
    setScratchpad(prev => [...prev, meal]);
    setScratchPickerOpen(false);
    setScratchSearch("");
  };

  const saveToDrawer = () => {
    if (!saveLeftoverPopover) return;
    const { meal, type, portions } = saveLeftoverPopover;
    setInventory(prev => {
      const existing = prev.find(i => i.name === meal.name);
      if (existing) return prev.map(i => i.id === existing.id ? { ...i, portions: i.portions + portions } : i);
      return [...prev, { id: Date.now(), name: meal.name, type, portions, mealTypes: meal.mealTypes || [] }];
    });
    setSaveLeftoverPopover(null);
  };

  const removeFromScratchpad = (id) => setScratchpad(prev => prev.filter(m => m.id !== id));

  const dropMeal = (toDay, toSlot) => {
    const source = dragRef.current;
    if (!source) return;
    const { meal, fromDay, fromSlot } = source;
    if (fromDay === toDay && fromSlot === toSlot) { dragRef.current = null; setDragging(null); setDragOver(null); return; }
    const displaced = plan[toDay][toSlot];
    setPlan(prev => {
      const next = { ...prev };
      next[fromDay] = { ...next[fromDay], [fromSlot]: displaced || null };
      next[toDay]   = { ...next[toDay],   [toSlot]:  meal };
      return next;
    });
    dragRef.current = null;
    setDragging(null);
    setDragOver(null);
  };

  const planFromScratchpad = (meal, day, slot) => {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: meal } }));
    setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, cookCount: m.cookCount + 1 } : m));
    removeFromScratchpad(meal.id);
    setScratchPlanningId(null);
  };

  const addInventoryItem = () => {
    if (!newInvItem.name.trim()) return;
    setInventory(prev => [...prev, { ...newInvItem, id: Date.now(), name: newInvItem.name.trim() }]);
    setNewInvItem({ name: "", type: "leftover", portions: 2, mealTypes: [] });
    setAddingInv(false);
  };

  const removeInventoryItem = (id) => setInventory(prev => prev.filter(i => i.id !== id));

  const planIntoWeek = (item, day, slot) => {
    const meal = { id: `inv-${item.id}-${Date.now()}`, name: item.name, tags: [], mealTypes: item.mealTypes, cookCount: 0, ingredients: [], isInventory: true, invType: item.type };
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: meal } }));
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, portions: i.portions - 1 } : i).filter(i => i.portions > 0));
    setPlanningItem(null);
  };

  const useInventoryItem = (item, meal) => {
    // reduce portions, remove if 0
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, portions: i.portions - 1 } : i).filter(i => i.portions > 0));
    assignMeal(meal || { id: `inv-${item.id}`, name: item.name, tags: [], mealTypes: item.mealTypes, cookCount: 0, ingredients: [], isInventory: true });
  };

  // inventory items that match the current slot being selected
  const matchingInventory = selecting
    ? inventory.filter(i => !i.mealTypes?.length || i.mealTypes.includes(selecting.slot))
    : [];

  const assignMeal = (meal) => {
    if (!selecting) return;
    setPlan(prev => ({
      ...prev,
      [selecting.day]: { ...prev[selecting.day], [selecting.slot]: meal }
    }));
    setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, cookCount: m.cookCount + 1 } : m));
    setSelecting(null);
    setSearch("");
    setFilterTag(null);
  };

  const [restorePrompt, setRestorePrompt] = useState(null); // { meal, day, slot }

  const removeMeal = (day, slot) => {
    const meal = plan[day][slot];
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: null } }));
    if (meal) setRestorePrompt({ meal, day, slot });
  };

  const confirmRestore = () => {
    if (!restorePrompt) return;
    const { meal } = restorePrompt;
    setInventory(prev => {
      const existing = prev.find(i => i.name === meal.name);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, portions: i.portions + 1 } : i);
      }
      return [...prev, {
        id: Date.now(), name: meal.name,
        type: meal.invType || "leftover",
        portions: 1,
        mealTypes: meal.mealTypes || [],
      }];
    });
    setRestorePrompt(null);
  };

  const confirmAddToWeek = () => {
    if (!restorePrompt) return;
    const { meal } = restorePrompt;
    const bankMeal = meals.find(m => m.id === meal.id) || meal;
    if (!scratchpad.find(m => m.id === bankMeal.id)) {
      setScratchpad(prev => [...prev, bankMeal]);
    }
    setRestorePrompt(null);
  };

  const getShoppingList = () => {
    const all = {};
    DAYS.forEach(d => SLOTS.forEach(s => {
      const meal = plan[d][s];
      if (meal) meal.ingredients.forEach(i => { all[i] = (all[i] || 0) + 1; });
    }));
    scratchpad.forEach(meal => {
      (meal.ingredients || []).forEach(i => { all[i] = (all[i] || 0) + 1; });
    });
    pantryShoppingItems.forEach(i => { all[i] = all[i] || 0; });
    snackShoppingList.forEach(i => { all[i] = all[i] || 0; });
    return Object.entries(all).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const topMeals = [...meals].sort((a, b) => b.cookCount - a.cookCount).slice(0, 5);

  const filteredMeals = meals.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || m.tags.includes(filterTag);
    const matchSlot = !selecting || !m.mealTypes?.length || m.mealTypes.includes(selecting.slot);
    return matchSearch && matchTag && matchSlot;
  });

  const getSuggestions = async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    const topNames = topMeals.map(m => m.name).join(", ");
    const prompt = `You are a helpful family meal planner assistant. A family with kids needs dinner ideas.
Their most cooked meals are: ${topNames}.
Goal: ${aiGoal || "quick weeknight dinners"}.
Suggest 4 new meal ideas they haven't tried much. For each meal return JSON only.
Respond ONLY with a JSON array, no markdown, no explanation. Format:
[{"name":"Meal Name","tags":["⚡ Quick"],"why":"one sentence reason","ingredients":["item1","item2","item3","item4"]}]
Only use tags from this list: ⚡ Quick, 💪 High Protein, ❄️ Freezer Friendly, 🥗 Veggie, 👶 Kid Friendly, 🍲 Batch Cook`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiSuggestions(parsed);
    } catch (e) {
      setAiSuggestions([{ name: "Couldn't load suggestions", tags: [], why: "Please try again.", ingredients: [] }]);
    }
    setAiLoading(false);
  };

  const addSuggestedMeal = (s) => {
    const newId = Date.now();
    setMeals(prev => [...prev, { id: newId, name: s.name, tags: s.tags, cookCount: 0, ingredients: s.ingredients }]);
  };

  const addCustomMeal = () => {
    if (!newMeal.name.trim()) return;
    setMeals(prev => [...prev, {
      id: Date.now(),
      name: newMeal.name.trim(),
      tags: newMeal.tags,
      mealTypes: newMeal.mealTypes,
      cookCount: 0,
      ingredients: newMeal.ingredients.split(",").map(i => i.trim()).filter(Boolean)
    }]);
    setNewMeal({ name: "", tags: [], mealTypes: [], ingredients: "" });
    setAddingMeal(false);
  };

  const shoppingList = getShoppingList();
  const plannedCount = DAYS.reduce((acc, d) => acc + SLOTS.filter(s => plan[d][s]).length, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .mp { min-height: 100vh; background: #faf7f2; font-family: 'Nunito', sans-serif; color: #2d2416; }

        /* Header */
        .header { background: #2d2416; padding: 18px 20px 0; }
        .header-top { display: flex; align-items: center; justify-content: space-between; max-width: 900px; margin: 0 auto; padding-bottom: 0; }
        .logo { font-family: 'Lora', serif; font-size: 22px; color: #f5e6c8; letter-spacing: -0.01em; }
        .logo span { color: #e8a045; font-style: italic; }
        .planned-badge { font-size: 12px; color: #a89070; background: #3d3020; padding: 4px 12px; border-radius: 999px; }

        .nav { display: flex; gap: 4px; max-width: 900px; margin: 0 auto; padding-top: 14px; }
        .nav-btn { padding: 9px 18px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; border-radius: 8px 8px 0 0; font-family: 'Nunito', sans-serif; transition: all 0.15s; }
        .nav-btn.active { background: #faf7f2; color: #2d2416; }
        .nav-btn.inactive { background: transparent; color: #a89070; }
        .nav-btn.inactive:hover { color: #f5e6c8; }

        .content { max-width: 900px; margin: 0 auto; padding: 24px 16px 60px; }

        /* Planner grid */
        .week-grid { display: grid; grid-template-columns: 80px repeat(7, 1fr); gap: 6px; }
        .col-head { text-align: center; padding: 8px 4px; font-size: 12px; font-weight: 700; color: #8a7060; text-transform: uppercase; letter-spacing: 0.06em; }
        .row-label { display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-size: 11px; font-weight: 700; color: #8a7060; text-transform: uppercase; letter-spacing: 0.05em; }

        .meal-cell {
          background: #fff;
          border: 1.5px solid #ede5d8;
          border-radius: 10px;
          min-height: 72px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .meal-cell:hover { border-color: #e8a045; background: #fffdf8; }
        .meal-cell.filled { background: #fffbf4; border-color: #e8c07a; justify-content: flex-start; align-items: flex-start; text-align: left; }
        .meal-cell.selecting-active { border-color: #e8a045; background: #fffbf4; box-shadow: 0 0 0 2px #e8a04544; }

        .cell-empty-text { font-size: 18px; color: #d4c4b0; }
        .cell-meal-name { font-size: 11px; font-weight: 700; color: #2d2416; line-height: 1.3; margin-bottom: 4px; }
        .cell-tag { font-size: 9px; padding: 1px 5px; border-radius: 999px; margin-right: 2px; margin-bottom: 2px; display: inline-block; }
        .cell-remove { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: #f87171; border: none; color: #fff; font-size: 10px; cursor: pointer; opacity: 0; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; line-height: 1; }
        .meal-cell:hover .cell-remove { opacity: 1; }

        /* Meal picker overlay */
        .overlay { position: fixed; inset: 0; background: #0008; z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
        .picker { background: #faf7f2; border-radius: 20px 20px 0 0; width: 100%; max-width: 500px; padding: 20px; max-height: 75vh; display: flex; flex-direction: column; }
        .picker-title { font-family: 'Lora', serif; font-size: 18px; color: #2d2416; margin-bottom: 14px; }
        .picker-search { width: 100%; padding: 10px 14px; border: 1.5px solid #e0d4c4; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; background: #fff; outline: none; margin-bottom: 10px; }
        .picker-search:focus { border-color: #e8a045; }
        .tag-scroll { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 12px; padding-bottom: 4px; scrollbar-width: none; }
        .tag-scroll::-webkit-scrollbar { display: none; }
        .tag-pill { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; border: 1.5px solid #e0d4c4; background: #fff; cursor: pointer; white-space: nowrap; transition: all 0.15s; font-family: 'Nunito', sans-serif; }
        .tag-pill.active { background: #2d2416; color: #fff; border-color: #2d2416; }
        .meals-scroll { overflow-y: auto; flex: 1; }
        .meal-pick-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.12s; border: 1px solid transparent; }
        .meal-pick-item:hover { background: #fff; border-color: #e8a045; }
        .meal-pick-name { font-size: 14px; font-weight: 600; color: #2d2416; flex: 1; }
        .cook-count { font-size: 11px; color: #a89070; }
        .cancel-btn { margin-top: 12px; width: 100%; padding: 11px; border: 1.5px solid #e0d4c4; border-radius: 10px; background: transparent; font-family: 'Nunito', sans-serif; font-size: 14px; color: #8a7060; cursor: pointer; }

        /* Meals view */
        .section-title { font-family: 'Lora', serif; font-size: 20px; color: #2d2416; margin-bottom: 16px; }
        .meals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .meal-card { background: #fff; border: 1.5px solid #ede5d8; border-radius: 14px; padding: 14px; transition: all 0.15s; }
        .meal-card:hover { border-color: #e8a045; transform: translateY(-2px); box-shadow: 0 4px 16px #00000010; }
        .meal-card-name { font-family: 'Lora', serif; font-size: 15px; font-weight: 600; color: #2d2416; margin-bottom: 8px; }
        .meal-card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
        .meal-card-tag { font-size: 10px; padding: 2px 7px; border-radius: 999px; }
        .meal-card-count { font-size: 11px; color: #a89070; }
        .cook-bar { height: 3px; background: #ede5d8; border-radius: 2px; margin-top: 6px; }
        .cook-bar-fill { height: 100%; background: #e8a045; border-radius: 2px; }

        .add-meal-btn { display: flex; align-items: center; gap: 8px; padding: 12px 18px; background: #2d2416; color: #f5e6c8; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px; transition: background 0.15s; }
        .add-meal-btn:hover { background: #3d3020; }

        .add-form { background: #fff; border: 1.5px solid #e8a045; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
        .form-label { font-size: 12px; font-weight: 700; color: #8a7060; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; display: block; }
        .form-input { width: 100%; padding: 9px 12px; border: 1.5px solid #e0d4c4; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 14px; background: #faf7f2; outline: none; margin-bottom: 12px; }
        .form-input:focus { border-color: #e8a045; }
        .form-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .form-tag { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; border: 1.5px solid #e0d4c4; background: #faf7f2; cursor: pointer; transition: all 0.15s; font-family: 'Nunito', sans-serif; }
        .form-tag.sel { background: #2d2416; color: #fff; border-color: #2d2416; }
        .form-row { display: flex; gap: 8px; }
        .save-btn { flex: 1; padding: 10px; background: #e8a045; color: #fff; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .save-btn:hover { background: #d4903a; }
        .discard-btn { padding: 10px 16px; background: transparent; border: 1.5px solid #e0d4c4; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 14px; color: #8a7060; cursor: pointer; }

        /* Shopping */
        .shopping-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .clear-btn { font-size: 12px; color: #a89070; cursor: pointer; background: none; border: none; font-family: 'Nunito', sans-serif; }
        .shop-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; background: #fff; border: 1px solid #ede5d8; border-radius: 10px; margin-bottom: 6px; cursor: pointer; transition: all 0.12s; }
        .shop-item:hover { border-color: #e8a045; }
        .shop-item.checked { opacity: 0.45; }
        .shop-check { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #e0d4c4; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
        .shop-check.on { background: #e8a045; border-color: #e8a045; }
        .shop-item-name { flex: 1; font-size: 14px; font-weight: 500; color: #2d2416; text-transform: capitalize; }
        .shop-item-name.checked { text-decoration: line-through; color: #a89070; }
        .no-plan { text-align: center; padding: 40px 20px; color: #a89070; font-size: 14px; }
        .no-plan-emoji { font-size: 40px; display: block; margin-bottom: 10px; }

        /* Suggest */
        .suggest-intro { background: #2d2416; border-radius: 16px; padding: 20px; margin-bottom: 20px; color: #f5e6c8; }
        .suggest-intro h2 { font-family: 'Lora', serif; font-size: 20px; margin-bottom: 6px; }
        .suggest-intro p { font-size: 13px; color: #a89070; margin-bottom: 14px; }
        .goal-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: none; font-family: 'Nunito', sans-serif; font-size: 14px; background: #3d3020; color: #f5e6c8; outline: none; margin-bottom: 12px; }
        .goal-input::placeholder { color: #6b5a44; }
        .suggest-btn { width: 100%; padding: 12px; background: #e8a045; color: #fff; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .suggest-btn:hover { background: #d4903a; }
        .suggest-btn:disabled { opacity: 0.6; cursor: wait; }

        .suggestion-card { background: #fff; border: 1.5px solid #ede5d8; border-radius: 14px; padding: 16px; margin-bottom: 10px; }
        .sug-name { font-family: 'Lora', serif; font-size: 17px; font-weight: 600; color: #2d2416; margin-bottom: 6px; }
        .sug-why { font-size: 13px; color: #6b5a44; margin-bottom: 10px; font-style: italic; }
        .sug-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
        .sug-add-btn { padding: 7px 14px; background: #2d2416; color: #f5e6c8; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .sug-add-btn:hover { background: #e8a045; }
        .sug-add-btn.added { background: #4ade80; color: #fff; cursor: default; }

        .top-meals { margin-bottom: 20px; }
        .top-meal-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #ede5d8; }
        .top-rank { font-size: 18px; width: 28px; text-align: center; }
        .top-name { flex: 1; font-size: 14px; font-weight: 600; }
        .top-count { font-size: 12px; color: #a89070; }

        /* Drawer */
        .drawer-fab { position: fixed; bottom: 24px; right: 24px; z-index: 200; background: #2d2416; color: #f5e6c8; border: none; border-radius: 999px; padding: 12px 20px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px #00000030; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .drawer-fab:hover { background: #e8a045; color: #fff; transform: translateY(-2px); }
        .drawer-fab .inv-count { background: #e8a045; color: #fff; border-radius: 999px; padding: 1px 7px; font-size: 11px; }
        .pantry-fab { position: fixed; bottom: 136px; right: 24px; z-index: 200; background: #4a7c59; color: #f0faf4; border: none; border-radius: 999px; padding: 12px 20px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px #00000030; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .pantry-fab:hover { background: #3a6347; color: #fff; transform: translateY(-2px); }
        .snacks-fab { position: fixed; bottom: 80px; right: 24px; z-index: 200; background: #7c5cbf; color: #f5f0ff; border: none; border-radius: 999px; padding: 12px 20px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px #00000030; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .snacks-fab:hover { background: #6446a8; color: #fff; transform: translateY(-2px); }
        .snacks-count { background: #fff; color: #7c5cbf; border-radius: 999px; padding: 1px 7px; font-size: 11px; font-weight: 700; }
        .snacks-drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 300px; background: #f8f5ff; z-index: 400; box-shadow: -4px 0 30px #00000020; display: flex; flex-direction: column; }
        .snacks-header { background: #7c5cbf; padding: 20px; color: #f5f0ff; display: flex; align-items: center; justify-content: space-between; }
        .snacks-title { font-family: 'Lora', serif; font-size: 18px; }
        .snacks-body { flex: 1; overflow-y: auto; padding: 16px; }
        .snacks-add-row { display: flex; gap: 8px; margin-bottom: 14px; }
        .snacks-input { flex: 1; padding: 8px 12px; border: 1.5px solid #d8c8f0; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 13px; background: #fff; outline: none; }
        .snacks-input:focus { border-color: #7c5cbf; }
        .snacks-add-btn { padding: 8px 14px; background: #7c5cbf; color: #fff; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; }
        .snacks-add-btn:hover { background: #6446a8; }
        .snack-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #fff; border: 1px solid #e0d4f8; border-radius: 8px; margin-bottom: 6px; }
        .snack-item-emoji { font-size: 18px; }
        .snack-item-name { flex: 1; font-size: 13px; font-weight: 600; color: #2d2416; }
        .snack-item-remove { background: none; border: none; color: #c4b4e0; cursor: pointer; font-size: 15px; padding: 2px 4px; line-height: 1; }
        .snack-item-remove:hover { color: #f87171; }
        .snack-item-buy { padding: 3px 9px; background: transparent; border: 1.5px solid #7c5cbf; border-radius: 999px; color: #7c5cbf; font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; flex-shrink: 0; }
        .snack-item-buy:hover { background: #7c5cbf; color: #fff; }
        .snacks-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9070c0; margin: 14px 0 8px; }
        .snack-shop-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #fff; border: 1px solid #e0d4f8; border-left: 3px solid #7c5cbf; border-radius: 8px; margin-bottom: 6px; }
        .snack-shop-name { flex: 1; font-size: 13px; font-weight: 600; color: #2d2416; }
        .snack-shop-got { padding: 3px 9px; background: #7c5cbf; color: #fff; border: none; border-radius: 999px; font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .snack-shop-got:hover { background: #6446a8; }
        .snacks-empty { text-align: center; padding: 30px 10px; color: #b0a0d0; font-size: 13px; line-height: 1.6; }
        .pantry-count { background: #fff; color: #4a7c59; border-radius: 999px; padding: 1px 7px; font-size: 11px; font-weight: 700; }

        /* Pantry drawer */
        .pantry-drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 320px; background: #f4faf6; z-index: 400; box-shadow: -4px 0 30px #00000020; display: flex; flex-direction: column; }
        .pantry-header { background: #4a7c59; padding: 20px; color: #f0faf4; display: flex; align-items: center; justify-content: space-between; }
        .pantry-title { font-family: 'Lora', serif; font-size: 18px; }
        .pantry-body { flex: 1; overflow-y: auto; padding: 16px; }
        .pantry-intro { font-size: 13px; color: #5a7a64; margin-bottom: 14px; line-height: 1.5; }
        .pantry-add-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .pantry-input { flex: 1; padding: 8px 12px; border: 1.5px solid #c4deca; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 13px; background: #fff; outline: none; }
        .pantry-input:focus { border-color: #4a7c59; }
        .pantry-add-btn { padding: 8px 14px; background: #4a7c59; color: #fff; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; }
        .pantry-add-btn:hover { background: #3a6347; }
        .pantry-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #fff; border: 1px solid #d4e8da; border-radius: 8px; margin-bottom: 6px; }
        .pantry-item-name { flex: 1; font-size: 13px; font-weight: 600; color: #2d2416; text-transform: capitalize; }
        .pantry-item-buy { padding: 3px 9px; background: transparent; border: 1.5px solid #e8a045; border-radius: 999px; color: #e8a045; font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .pantry-item-buy:hover { background: #e8a045; color: #fff; }
        .pantry-item-buy.added { background: #dcfce7; border-color: #4a7c59; color: #4a7c59; cursor: default; }
        .pantry-item-remove { background: none; border: none; color: #b0c8b8; cursor: pointer; font-size: 15px; padding: 2px 4px; line-height: 1; flex-shrink: 0; }
        .pantry-item-remove:hover { color: #f87171; }
        .pantry-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #5a7a64; margin: 12px 0 8px; }

        /* Shopping list pantry styles */
        .shop-item.in-pantry { opacity: 0.4; }
        .pantry-badge { font-size: 9px; padding: 1px 6px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; flex-shrink: 0; }
        .shop-toggle-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .pantry-toggle { font-size: 12px; color: #4a7c59; background: #dcfce7; border: none; border-radius: 999px; padding: 4px 12px; cursor: pointer; font-family: 'Nunito', sans-serif; font-weight: 700; }
        .pantry-toggle:hover { background: #bbf7d0; }

        .drawer-backdrop { position: fixed; inset: 0; background: #00000055; z-index: 300; }
        .drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 340px; background: #faf7f2; z-index: 400; box-shadow: -4px 0 30px #00000020; display: flex; flex-direction: column; transition: transform 0.3s ease; }
        .drawer-header { background: #2d2416; padding: 20px; color: #f5e6c8; display: flex; align-items: center; justify-content: space-between; }
        .drawer-title { font-family: 'Lora', serif; font-size: 18px; }
        .drawer-close { background: none; border: none; color: #a89070; font-size: 20px; cursor: pointer; padding: 4px; line-height: 1; }
        .drawer-close:hover { color: #f5e6c8; }
        .drawer-body { flex: 1; overflow-y: auto; padding: 16px; }

        .inv-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8a7060; margin: 12px 0 8px; }
        .inv-item { background: #fff; border: 1.5px solid #ede5d8; border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
        .inv-item.leftover { border-left: 3px solid #fb923c; }
        .inv-item.freezer { border-left: 3px solid #38bdf8; }
        .inv-icon { font-size: 20px; flex-shrink: 0; }
        .inv-info { flex: 1; }
        .inv-name { font-size: 13px; font-weight: 700; color: #2d2416; margin-bottom: 2px; }
        .inv-meta { font-size: 11px; color: #a89070; }
        .inv-slots { display: flex; gap: 3px; margin-top: 4px; flex-wrap: wrap; }
        .inv-slot-tag { font-size: 9px; padding: 1px 6px; border-radius: 999px; background: #f5e6c8; color: #92400e; font-weight: 600; }
        .inv-remove { background: none; border: none; color: #d4c4b0; cursor: pointer; font-size: 16px; padding: 2px; line-height: 1; }
        .inv-remove:hover { color: #f87171; }

        .portions-ctrl { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
        .portions-btn { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #e0d4c4; background: #faf7f2; color: #2d2416; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; font-family: 'Nunito', sans-serif; }
        .portions-btn:hover { border-color: #e8a045; }
        .portions-val { font-size: 13px; font-weight: 700; color: #2d2416; min-width: 20px; text-align: center; }

        .add-inv-btn { width: 100%; padding: 10px; background: transparent; border: 1.5px dashed #e0d4c4; border-radius: 10px; color: #a89070; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: all 0.15s; }
        .add-inv-btn:hover { border-color: #e8a045; color: #e8a045; }

        .inv-form { background: #fff; border: 1.5px solid #e8a045; border-radius: 12px; padding: 14px; margin-top: 10px; }
        .inv-type-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .inv-type-btn { flex: 1; padding: 7px; border-radius: 8px; border: 1.5px solid #e0d4c4; background: #faf7f2; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .inv-type-btn.sel-leftover { background: #fff7ed; border-color: #fb923c; color: #c2410c; }
        .inv-type-btn.sel-freezer { background: #f0f9ff; border-color: #38bdf8; color: #0369a1; }

        /* Picker inventory section */
        .picker-inv-section { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1.5px dashed #e0d4c4; }
        .picker-inv-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8a7060; margin-bottom: 8px; }
        .picker-inv-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.12s; border: 1.5px solid #ede5d8; background: #fff; margin-bottom: 6px; }
        .picker-inv-item:hover { border-color: #e8a045; background: #fffbf4; }
        .picker-inv-item.leftover-item { border-left: 3px solid #fb923c; }
        .picker-inv-item.freezer-item { border-left: 3px solid #38bdf8; }
        .picker-inv-badge { font-size: 10px; padding: 2px 8px; border-radius: 999px; font-weight: 700; flex-shrink: 0; }
        .picker-inv-badge.lo { background: #fff7ed; color: #c2410c; }
        .picker-inv-badge.fr { background: #f0f9ff; color: #0369a1; }

        .dot { width: 8px; height: 8px; border-radius: 50%; background: #e8a045; animation: bounce 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,80%,100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }

        /* Scratchpad */
        .planner-layout { display: flex; gap: 16px; align-items: flex-start; }
        .planner-grid-wrap { flex: 1; min-width: 0; overflow-x: auto; }
        .scratchpad { width: 220px; flex-shrink: 0; background: #fff; border: 1.5px solid #ede5d8; border-radius: 16px; overflow: hidden; }
        .scratch-header { background: #2d2416; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; }
        .scratch-title { font-family: 'Lora', serif; font-size: 14px; color: #f5e6c8; }
        .scratch-count { font-size: 10px; background: #e8a045; color: #fff; border-radius: 999px; padding: 1px 7px; font-weight: 700; }
        .scratch-body { padding: 10px; }
        .scratch-empty { text-align: center; padding: 20px 10px; color: #c4b4a4; font-size: 12px; line-height: 1.5; }
        .scratch-empty-icon { font-size: 28px; display: block; margin-bottom: 6px; }
        .scratch-item { background: #faf7f2; border: 1.5px solid #ede5d8; border-radius: 10px; padding: 9px 10px; margin-bottom: 7px; transition: border-color 0.15s; }
        .scratch-item:hover { border-color: #e8a045; }
        .scratch-item-top { display: flex; align-items: flex-start; gap: 6px; }
        .scratch-item-name { flex: 1; font-size: 12px; font-weight: 700; color: #2d2416; line-height: 1.3; }
        .scratch-item-slots { display: flex; gap: 3px; margin-top: 4px; flex-wrap: wrap; }
        .scratch-item-slot { font-size: 9px; padding: 1px 5px; border-radius: 999px; background: #f5e6c8; color: #92400e; font-weight: 600; }
        .scratch-item-btns { display: flex; gap: 4px; margin-top: 7px; }
        .scratch-plan-btn { flex: 1; padding: 5px; background: #2d2416; color: #f5e6c8; border: none; border-radius: 6px; font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .scratch-plan-btn:hover, .scratch-plan-btn.active { background: #e8a045; color: #fff; }
        .scratch-remove-btn { padding: 5px 8px; background: transparent; color: #c4b4a4; border: 1px solid #e0d4c4; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.15s; }
        .scratch-remove-btn:hover { color: #f87171; border-color: #fca5a5; }
        .scratch-add-btn { width: 100%; padding: 9px; background: transparent; border: 1.5px dashed #e0d4c4; border-radius: 10px; color: #a89070; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 4px; transition: all 0.15s; }
        .scratch-add-btn:hover { border-color: #e8a045; color: #e8a045; background: #fffbf4; }
        .scratch-picker { margin-top: 8px; background: #faf7f2; border: 1.5px solid #e8a045; border-radius: 10px; padding: 8px; }
        .scratch-picker-input { width: 100%; padding: 7px 10px; border: 1px solid #e0d4c4; border-radius: 7px; font-family: 'Nunito', sans-serif; font-size: 12px; background: #fff; outline: none; margin-bottom: 6px; }
        .scratch-picker-input:focus { border-color: #e8a045; }
        .scratch-picker-list { max-height: 180px; overflow-y: auto; }
        .scratch-picker-item { padding: 7px 8px; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 600; color: #2d2416; transition: background 0.12s; display: flex; align-items: center; justify-content: space-between; }
        .scratch-picker-item:hover { background: #fff; }
        .scratch-picker-item.already { color: #c4b4a4; cursor: default; }

        .scratch-new-form { margin-top: 8px; background: #fffbf4; border: 1.5px solid #e8a045; border-radius: 10px; padding: 10px; }
        .scratch-new-form input, .scratch-new-form textarea { width: 100%; padding: 6px 9px; border: 1px solid #e0d4c4; border-radius: 7px; font-family: 'Nunito', sans-serif; font-size: 12px; background: #fff; outline: none; margin-bottom: 7px; display: block; }
        .scratch-new-form input:focus, .scratch-new-form textarea:focus { border-color: #e8a045; }
        .scratch-new-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #8a7060; margin-bottom: 4px; display: block; }
        .scratch-new-slot-row { display: flex; gap: 4px; margin-bottom: 7px; flex-wrap: wrap; }
        .scratch-new-slot-btn { padding: 3px 8px; border-radius: 999px; border: 1px solid #e0d4c4; background: #faf7f2; font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.12s; }
        .scratch-new-slot-btn.sel { background: #2d2416; color: #f5e6c8; border-color: #2d2416; }
        .scratch-new-save { width: 100%; padding: 7px; background: #e8a045; color: #fff; border: none; border-radius: 7px; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; margin-top: 2px; }
        .scratch-new-save:hover { background: #d4903a; }
        .scratch-divider { text-align: center; font-size: 10px; color: #c4b4a4; margin: 6px 0; letter-spacing: 0.06em; }
        .scratch-create-btn { width: 100%; padding: 6px; background: transparent; border: 1px dashed #e0d4c4; border-radius: 7px; color: #a89070; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700; cursor: pointer; margin-top: 4px; transition: all 0.15s; }
        .scratch-create-btn:hover { border-color: #e8a045; color: #e8a045; }

        .cell-save { position: absolute; bottom: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: #fb923c; border: none; color: #fff; font-size: 9px; cursor: pointer; opacity: 0; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; }
        .meal-cell:hover .cell-save { opacity: 1; }

        .leftover-popover { position: fixed; z-index: 600; background: #2d2416; border-radius: 14px; padding: 14px 16px; box-shadow: 0 8px 32px #00000040; width: 220px; }
        .leftover-popover-title { font-size: 12px; font-weight: 700; color: #f5e6c8; margin-bottom: 4px; }
        .leftover-popover-name { font-size: 11px; color: #e8a045; font-style: italic; margin-bottom: 10px; }
        .leftover-type-row { display: flex; gap: 6px; margin-bottom: 10px; }
        .leftover-type-btn { flex: 1; padding: 6px; border-radius: 7px; border: 1.5px solid #4a3828; background: transparent; color: #a89070; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .leftover-type-btn.sel-lo { background: #fff7ed; border-color: #fb923c; color: #c2410c; }
        .leftover-type-btn.sel-fr { background: #f0f9ff; border-color: #38bdf8; color: #0369a1; }
        .leftover-portions-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .leftover-portions-label { font-size: 11px; color: #a89070; flex: 1; }
        .leftover-save-btn { width: 100%; padding: 8px; background: #e8a045; color: #fff; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; }
        .leftover-save-btn:hover { background: #d4903a; }
        .leftover-cancel-btn { width: 100%; padding: 6px; background: transparent; border: none; color: #6a5848; font-family: 'Nunito', sans-serif; font-size: 11px; cursor: pointer; margin-top: 4px; }
        .leftover-cancel-btn:hover { color: #a89070; }

        /* Mobile day view */
        .mobile-day-nav { display: none; }
        .mobile-slot-card { background: #fff; border: 1.5px solid #ede5d8; border-radius: 14px; padding: 14px; margin-bottom: 10px; position: relative; }
        .mobile-slot-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8a7060; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .mobile-meal-name { font-size: 15px; font-weight: 700; color: #2d2416; margin-bottom: 6px; }
        .mobile-meal-tag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 999px; margin-right: 4px; }
        .mobile-add-btn { width: 100%; padding: 12px; background: #faf7f2; border: 1.5px dashed #e0d4c4; border-radius: 10px; color: #a89070; font-family: 'Nunito', sans-serif; font-size: 14px; cursor: pointer; }
        .mobile-add-btn:active { background: #f5ede0; }
        .mobile-cell-actions { display: flex; gap: 8px; margin-top: 8px; }
        .mobile-action-btn { flex: 1; padding: 7px; border-radius: 8px; border: 1px solid #e0d4c4; background: transparent; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 600; color: #8a7060; cursor: pointer; }
        .mobile-action-btn.danger { color: #f87171; border-color: #fca5a5; }
        .mobile-action-btn:active { background: #faf7f2; }
        .day-nav-row { display: none; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .day-nav-arrow { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #e0d4c4; background: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #2d2416; }
        .day-nav-arrow:disabled { opacity: 0.3; }
        .day-nav-label { text-align: center; }
        .day-nav-name { font-family: 'Lora', serif; font-size: 20px; color: #2d2416; font-weight: 600; }
        .day-nav-dots { display: flex; gap: 5px; justify-content: center; margin-top: 5px; }
        .day-dot { width: 6px; height: 6px; border-radius: 50%; background: #e0d4c4; transition: background 0.15s; }
        .day-dot.active { background: #e8a045; }
        .mobile-this-week { background: #fff; border: 1.5px solid #ede5d8; border-radius: 14px; overflow: hidden; margin-top: 16px; }
        .mobile-this-week-header { background: #2d2416; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .mobile-this-week-toggle { font-size: 11px; color: #a89070; }

        @media (max-width: 640px) {
          .planner-layout { display: block; }
          .planner-grid-wrap { display: none; }
          .scratchpad { display: none; }
          .day-nav-row { display: flex; }
          .mobile-day-view { display: block; }
          .mobile-this-week { display: block; }
          .drawer-fab { bottom: calc(24px + env(safe-area-inset-bottom)); right: 16px; padding: 10px 16px; font-size: 13px; }
          .snacks-fab { bottom: calc(74px + env(safe-area-inset-bottom)); right: 16px; padding: 10px 16px; font-size: 13px; }
          .pantry-fab { bottom: calc(124px + env(safe-area-inset-bottom)); right: 16px; padding: 10px 16px; font-size: 13px; }
          .content { padding: 16px 12px calc(180px + env(safe-area-inset-bottom)); }
        }
        @media (min-width: 641px) {
          .mobile-day-view { display: none; }
          .mobile-this-week { display: none; }
          .day-nav-row { display: none; }
        }

        .meal-cell.dragging-source { opacity: 0.4; border-style: dashed; }
        .meal-cell.drag-over-empty { border-color: #e8a045; background: #fffbf4; box-shadow: 0 0 0 2px #e8a04555; }
        .meal-cell.drag-over-filled { border-color: #6b8fba; background: #f0f6ff; box-shadow: 0 0 0 2px #6b8fba55; }
        .drag-handle { position: absolute; top: 4px; left: 4px; color: #d4c4b0; font-size: 11px; cursor: grab; line-height: 1; padding: 2px; }
        .drag-handle:active { cursor: grabbing; }
        .meal-cell.filled:hover .drag-handle { color: #a89070; }

        .restore-toast { position: fixed; bottom: 88px; right: 24px; z-index: 500; background: #2d2416; color: #f5e6c8; border-radius: 14px; padding: 14px 16px; box-shadow: 0 6px 24px #00000035; display: flex; flex-direction: column; gap: 10px; max-width: 280px; animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .restore-toast-title { font-size: 13px; font-weight: 700; color: #f5e6c8; }
        .restore-toast-name { font-size: 12px; color: #e8a045; font-style: italic; margin-top: -4px; }
        .restore-toast-msg { font-size: 12px; color: #a89070; }
        .restore-toast-btns { display: flex; gap: 8px; }
        .restore-yes { flex: 1; padding: 8px; background: #e8a045; color: #fff; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .restore-yes:hover { background: #d4903a; }
        .restore-no { flex: 1; padding: 8px; background: transparent; color: #a89070; border: 1px solid #4a3828; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .restore-no:hover { color: #f5e6c8; border-color: #6a5848; }

        .plan-it-btn { padding: 5px 12px; background: #2d2416; color: #f5e6c8; border: none; border-radius: 6px; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
        .plan-it-btn:hover { background: #e8a045; color: #fff; }
        .plan-it-btn.active { background: #e8a045; color: #fff; }
        .plan-grid { margin-top: 10px; border: 1.5px solid #e8a045; border-radius: 10px; overflow: hidden; background: #fffbf4; }
        .plan-grid-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #8a7060; padding: 8px 10px 4px; }
        .plan-grid-table { width: 100%; border-collapse: collapse; }
        .plan-grid-table th { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #a89070; padding: 4px 6px; text-align: center; background: #fff8f0; }
        .plan-grid-table td { padding: 3px 4px; text-align: center; }
        .plan-slot-btn { width: 100%; padding: 4px 2px; font-size: 10px; font-weight: 600; border: 1px solid #e0d4c4; border-radius: 5px; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.12s; }
        .plan-slot-btn.empty { background: #fff; color: #2d2416; }
        .plan-slot-btn.empty:hover { background: #e8a045; color: #fff; border-color: #e8a045; transform: scale(1.05); }
        .plan-slot-btn.taken { background: #f3ede6; color: #b8a898; cursor: not-allowed; font-size: 9px; border-color: #ede5d8; }
        .plan-grid-cancel { width: 100%; padding: 6px; background: transparent; border: none; border-top: 1px solid #ede5d8; color: #a89070; font-family: 'Nunito', sans-serif; font-size: 11px; cursor: pointer; }
        .plan-grid-cancel:hover { color: #2d2416; background: #f5f0e8; }
      `}</style>

      <div className="mp">
        <div className="header">
          <div className="header-top">
            <div className="logo">family <span>feast</span></div>
            <div className="planned-badge">{plannedCount} / {DAYS.length * SLOTS.length} meals planned</div>
          </div>
          <div className="nav">
            {[["planner","🗓 Planner"],["meals","🍽 Meal Bank"],["shopping","🛒 Shopping"],["suggest","✨ Suggest"]].map(([v,l]) => (
              <button key={v} className={`nav-btn ${view === v ? "active" : "inactive"}`} onClick={() => setView(v)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="content">

          {/* ── PLANNER ── */}
          {view === "planner" && (
            <div className="planner-layout"
              onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                if (touchStartX.current === null) return;
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) setSelectedDay(d => Math.min(d + 1, DAYS.length - 1));
                  else setSelectedDay(d => Math.max(d - 1, 0));
                }
                touchStartX.current = null;
              }}
            >
              {/* ── Desktop grid ── */}
              <div className="planner-grid-wrap">
              <div className="week-grid">
                <div />
                {DAYS.map(d => <div key={d} className="col-head">{d.slice(0,3)}</div>)}
                {SLOTS.map(slot => (
                  <>
                    <div key={slot} className="row-label">{slot}</div>
                    {DAYS.map(day => {
                      const meal = plan[day][slot];
                      const isSelecting = selecting?.day === day && selecting?.slot === slot;
                      const isDraggingThis = dragging?.fromDay === day && dragging?.fromSlot === slot;
                      const isDragOver = dragOver?.day === day && dragOver?.slot === slot;
                      return (
                        <div
                          key={day+slot}
                          className={`meal-cell
                            ${meal ? "filled" : ""}
                            ${isSelecting ? "selecting-active" : ""}
                            ${isDraggingThis ? "dragging-source" : ""}
                            ${isDragOver && !meal ? "drag-over-empty" : ""}
                            ${isDragOver && meal && !isDraggingThis ? "drag-over-filled" : ""}
                          `}
                          onClick={() => !meal && !dragging && setSelecting({ day, slot })}
                          onDragOver={e => { e.preventDefault(); setDragOver({ day, slot }); }}
                          onDragLeave={() => setDragOver(null)}
                          onDrop={e => { e.preventDefault(); dropMeal(day, slot); }}
                        >
                          {meal ? (
                            <>
                              <span
                                className="drag-handle"
                                draggable
                                onDragStart={e => { e.stopPropagation(); const src = { meal, fromDay: day, fromSlot: slot }; dragRef.current = src; setDragging(src); }}
                                onDragEnd={() => { dragRef.current = null; setDragging(null); setDragOver(null); }}
                                title="Drag to another day"
                              >⠿</span>
                              <button className="cell-remove" onClick={(e) => { e.stopPropagation(); removeMeal(day, slot); }}>×</button>
                              <button className="cell-save" title="Save to fridge/freezer"
                                onClick={(e) => { e.stopPropagation(); const rect = e.target.getBoundingClientRect(); setSaveLeftoverPopover({ meal, day, slot, type: "leftover", portions: 2, x: rect.left, y: rect.bottom + 6 }); }}>
                                🍱
                              </button>
                              <div className="cell-meal-name">{meal.name}</div>
                              {meal.tags.slice(0,1).map(t => (
                                <span key={t} className="cell-tag" style={{ background: TAG_COLORS[t]?.bg, color: TAG_COLORS[t]?.text }}>{t}</span>
                              ))}
                            </>
                          ) : (
                            <span className="cell-empty-text">+</span>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
              </div>

              {/* Scratchpad panel */}
              <div className="scratchpad">
                <div className="scratch-header">
                  <div className="scratch-title">📝 This Week</div>
                  {scratchpad.length > 0 && <span className="scratch-count">{scratchpad.length}</span>}
                </div>
                <div className="scratch-body">
                  {scratchpad.length === 0 && !scratchPickerOpen && (
                    <div className="scratch-empty">
                      <span className="scratch-empty-icon">💡</span>
                      Ideas you want to cook this week — slot them in when you're ready
                    </div>
                  )}

                  {scratchpad.map(meal => (
                    <div key={meal.id} className="scratch-item">
                      <div className="scratch-item-top">
                        <div style={{ flex: 1 }}>
                          <div className="scratch-item-name">{meal.name}</div>
                          <div className="scratch-item-slots">
                            {(meal.mealTypes || []).map(s => (
                              <span key={s} className="scratch-item-slot">{SLOT_ICONS[s]} {s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="scratch-item-btns">
                        <button
                          className={`scratch-plan-btn ${scratchPlanningId === meal.id ? "active" : ""}`}
                          onClick={() => setScratchPlanningId(scratchPlanningId === meal.id ? null : meal.id)}
                        >
                          {scratchPlanningId === meal.id ? "Cancel" : "📅 Slot it"}
                        </button>
                        <button className="scratch-remove-btn" onClick={() => removeFromScratchpad(meal.id)}>×</button>
                      </div>
                      {scratchPlanningId === meal.id && (
                        <div style={{ marginTop: "8px" }}>
                          <PlanItGrid
                            item={{ ...meal, mealTypes: meal.mealTypes || [] }}
                            plan={plan}
                            onPlan={(_, day, slot) => planFromScratchpad(meal, day, slot)}
                            onClose={() => setScratchPlanningId(null)}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {scratchPickerOpen ? (
                    <div className="scratch-picker">
                      {scratchNewMeal ? (
                        /* ── Inline new meal form ── */
                        <div className="scratch-new-form">
                          <span className="scratch-new-label">Meal name</span>
                          <input
                            placeholder="e.g. Chicken Tray Bake"
                            value={scratchNewMeal.name}
                            onChange={e => setScratchNewMeal(p => ({ ...p, name: e.target.value }))}
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && saveScratchNewMeal()}
                          />
                          <span className="scratch-new-label">Serves as</span>
                          <div className="scratch-new-slot-row">
                            {SLOTS.map(s => (
                              <button key={s}
                                className={`scratch-new-slot-btn ${scratchNewMeal.mealTypes?.includes(s) ? "sel" : ""}`}
                                onClick={() => setScratchNewMeal(p => ({
                                  ...p, mealTypes: p.mealTypes?.includes(s)
                                    ? p.mealTypes.filter(x => x !== s)
                                    : [...(p.mealTypes || []), s]
                                }))}>
                                {SLOT_ICONS[s]} {s}
                              </button>
                            ))}
                          </div>
                          <span className="scratch-new-label">Ingredients (optional, comma separated)</span>
                          <input
                            placeholder="chicken, potatoes, olive oil..."
                            value={scratchNewMeal.ingredients || ""}
                            onChange={e => setScratchNewMeal(p => ({ ...p, ingredients: e.target.value }))}
                          />
                          <button className="scratch-new-save" onClick={saveScratchNewMeal}>
                            + Add to bank & queue
                          </button>
                          <div className="scratch-divider" style={{ marginTop: "8px" }}>
                            <button style={{ background: "none", border: "none", color: "#a89070", fontSize: "11px", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}
                              onClick={() => setScratchNewMeal(null)}>← back to search</button>
                          </div>
                        </div>
                      ) : (
                        /* ── Search existing meals ── */
                        <>
                          <input
                            className="scratch-picker-input"
                            placeholder="Search your meals..."
                            value={scratchSearch}
                            onChange={e => setScratchSearch(e.target.value)}
                            autoFocus
                          />
                          <div className="scratch-picker-list">
                            {meals
                              .filter(m => !scratchSearch || m.name.toLowerCase().includes(scratchSearch.toLowerCase()))
                              .sort((a, b) => b.cookCount - a.cookCount)
                              .map(m => {
                                const already = scratchpad.find(s => s.id === m.id);
                                return (
                                  <div
                                    key={m.id}
                                    className={`scratch-picker-item ${already ? "already" : ""}`}
                                    onClick={() => !already && addToScratchpad(m)}
                                  >
                                    <span>{m.name}</span>
                                    {already ? <span style={{ fontSize: "10px" }}>✓ added</span> : <span style={{ color: "#e8a045", fontSize: "11px" }}>+</span>}
                                  </div>
                                );
                              })}
                          </div>
                          <button className="scratch-create-btn" onClick={() => setScratchNewMeal({ name: scratchSearch, mealTypes: [], tags: [], ingredients: "" })}>
                            ✦ Create new meal
                          </button>
                          <button
                            style={{ width: "100%", padding: "6px", marginTop: "4px", background: "transparent", border: "none", color: "#a89070", fontSize: "11px", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}
                            onClick={() => { setScratchPickerOpen(false); setScratchSearch(""); setScratchNewMeal(null); }}
                          >close</button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button className="scratch-add-btn" onClick={() => setScratchPickerOpen(true)}>
                      + Add a meal idea
                    </button>
                  )}
                </div>
              </div>

              {/* ── Mobile day view ── */}
              <div className="day-nav-row">
                <button className="day-nav-arrow" onClick={() => setSelectedDay(d => Math.max(d - 1, 0))} disabled={selectedDay === 0}>‹</button>
                <div className="day-nav-label">
                  <div className="day-nav-name">{DAYS[selectedDay]}</div>
                  <div className="day-nav-dots">
                    {DAYS.map((_, i) => <div key={i} className={`day-dot ${i === selectedDay ? "active" : ""}`} />)}
                  </div>
                </div>
                <button className="day-nav-arrow" onClick={() => setSelectedDay(d => Math.min(d + 1, DAYS.length - 1))} disabled={selectedDay === DAYS.length - 1}>›</button>
              </div>

              <div className="mobile-day-view">
                {SLOTS.map(slot => {
                  const day = DAYS[selectedDay];
                  const meal = plan[day][slot];
                  return (
                    <div key={slot} className="mobile-slot-card">
                      <div className="mobile-slot-label">{SLOT_ICONS[slot]} {slot}</div>
                      {meal ? (
                        <>
                          <div className="mobile-meal-name">{meal.name}</div>
                          <div>
                            {meal.tags.slice(0, 2).map(t => (
                              <span key={t} className="mobile-meal-tag" style={{ background: TAG_COLORS[t]?.bg, color: TAG_COLORS[t]?.text }}>{t}</span>
                            ))}
                          </div>
                          <div className="mobile-cell-actions">
                            <button className="mobile-action-btn" onClick={() => {
                              const rect = document.body.getBoundingClientRect();
                              setSaveLeftoverPopover({ meal, day, slot, type: "leftover", portions: 2, x: rect.width / 2 - 110, y: 200 });
                            }}>🍱 Save leftovers</button>
                            <button className="mobile-action-btn danger" onClick={() => removeMeal(day, slot)}>Remove</button>
                          </div>
                        </>
                      ) : (
                        <button className="mobile-add-btn" onClick={() => setSelecting({ day, slot })}>+ Add meal</button>
                      )}
                    </div>
                  );
                })}

                {/* Mobile This Week */}
                <div className="mobile-this-week">
                  <div className="mobile-this-week-header" onClick={() => setScratchPickerOpen(p => !p)}>
                    <div className="scratch-title">📝 This Week {scratchpad.length > 0 && <span className="scratch-count">{scratchpad.length}</span>}</div>
                    <span className="mobile-this-week-toggle">{scratchPickerOpen ? "▲" : "▼"}</span>
                  </div>
                  {scratchPickerOpen && (
                    <div className="scratch-body">
                      {scratchpad.length === 0 && (
                        <div className="scratch-empty"><span className="scratch-empty-icon">💡</span>Queue meals you want this week</div>
                      )}
                      {scratchpad.map(meal => (
                        <div key={meal.id} className="scratch-item">
                          <div className="scratch-item-name">{meal.name}</div>
                          <div className="scratch-item-slots">
                            {(meal.mealTypes || []).map(s => <span key={s} className="scratch-item-slot">{SLOT_ICONS[s]} {s}</span>)}
                          </div>
                          <div className="scratch-item-btns">
                            <button className="scratch-plan-btn" onClick={() => {
                              planFromScratchpad(meal, DAYS[selectedDay], SLOTS.find(s => !plan[DAYS[selectedDay]][s]) || "Dinner");
                            }}>📅 Add to {DAYS[selectedDay]}</button>
                            <button className="scratch-remove-btn" onClick={() => removeFromScratchpad(meal.id)}>×</button>
                          </div>
                        </div>
                      ))}
                      <button className="scratch-add-btn" onClick={() => { setScratchPickerOpen(false); setTimeout(() => setScratchPickerOpen(true), 50); }}>+ Add a meal idea</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MEAL BANK ── */}
          {view === "meals" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div className="section-title">Your Meal Bank</div>
                <button className="add-meal-btn" onClick={() => setAddingMeal(true)}>+ Add Meal</button>
              </div>

              {addingMeal && (
                <div className="add-form">
                  <label className="form-label">Meal Name</label>
                  <input className="form-input" placeholder="e.g. Chicken Tray Bake" value={newMeal.name} onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))} />
                  <label className="form-label">Serves as</label>
                  <div className="form-tags" style={{ marginBottom: "12px" }}>
                    {SLOTS.map(s => (
                      <button key={s} className={`form-tag ${newMeal.mealTypes.includes(s) ? "sel" : ""}`}
                        onClick={() => setNewMeal(p => ({ ...p, mealTypes: p.mealTypes.includes(s) ? p.mealTypes.filter(x => x !== s) : [...p.mealTypes, s] }))}>
                        {SLOT_ICONS[s]} {s}
                      </button>
                    ))}
                  </div>
                  <label className="form-label">Tags</label>
                  <div className="form-tags">
                    {TAGS.map(t => (
                      <button key={t} className={`form-tag ${newMeal.tags.includes(t) ? "sel" : ""}`}
                        onClick={() => setNewMeal(p => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter(x => x !== t) : [...p.tags, t] }))}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <label className="form-label">Ingredients (comma separated)</label>
                  <input className="form-input" placeholder="chicken, potatoes, olive oil..." value={newMeal.ingredients} onChange={e => setNewMeal(p => ({ ...p, ingredients: e.target.value }))} />
                  <div className="form-row">
                    <button className="discard-btn" onClick={() => setAddingMeal(false)}>Cancel</button>
                    <button className="save-btn" onClick={addCustomMeal}>Save Meal</button>
                  </div>
                </div>
              )}

              <div className="meals-grid">
                {meals.map(m => (
                  <div key={m.id} className="meal-card">
                    <div className="meal-card-name">{m.name}</div>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px", flexWrap: "wrap" }}>
                      {(m.mealTypes || []).map(s => (
                        <span key={s} style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "999px", background: "#f5e6c8", color: "#92400e", fontWeight: 600 }}>{SLOT_ICONS[s]} {s}</span>
                      ))}
                    </div>
                    <div className="meal-card-tags">
                      {m.tags.map(t => <span key={t} className="meal-card-tag" style={{ background: TAG_COLORS[t]?.bg, color: TAG_COLORS[t]?.text }}>{t}</span>)}
                    </div>
                    <div className="meal-card-count">Cooked {m.cookCount}×</div>
                    <div className="cook-bar"><div className="cook-bar-fill" style={{ width: `${Math.min((m.cookCount / 15) * 100, 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SHOPPING ── */}
          {view === "shopping" && (
            <>
              {shoppingList.length === 0 ? (
                <div className="no-plan">
                  <span className="no-plan-emoji">🛒</span>
                  Plan your meals first and your shopping list will appear here!
                </div>
              ) : (
                <>
                  <div className="shopping-header">
                    <div className="section-title">Shopping List</div>
                    <button className="clear-btn" onClick={() => setShoppingChecked({})}>Clear checks</button>
                  </div>
                  <div style={{ fontSize: "13px", color: "#a89070", marginBottom: "12px" }}>
                    {shoppingList.length} items from {plannedCount} planned meal{plannedCount !== 1 ? "s" : ""}{scratchpad.length > 0 ? ` + ${scratchpad.length} in This Week` : ""}
                  </div>
                  <div className="shop-toggle-row">
                    <button className="pantry-toggle" onClick={() => setShowPantryItems(p => !p)}>
                      {showPantryItems ? "🫙 Hiding pantry items" : "🫙 Showing pantry items"}
                    </button>
                    {shoppingList.filter(([item]) => pantry.includes(item.toLowerCase())).length > 0 && (
                      <span style={{ fontSize: "12px", color: "#4a7c59" }}>
                        {shoppingList.filter(([item]) => pantry.includes(item.toLowerCase())).length} already in pantry
                      </span>
                    )}
                  </div>
                  {shoppingList
                    .filter(([item]) => showPantryItems ? true : !pantry.includes(item.toLowerCase()))
                    .map(([item]) => {
                      const inPantry = pantry.includes(item.toLowerCase());
                      return (
                        <div
                          key={item}
                          className={`shop-item ${shoppingChecked[item] ? "checked" : ""} ${inPantry ? "in-pantry" : ""}`}
                          onClick={() => {
                            if (inPantry) return;
                            const nowChecked = !shoppingChecked[item];
                            setShoppingChecked(p => ({ ...p, [item]: nowChecked }));
                            if (nowChecked && pantryShoppingItems.includes(item)) {
                              setPantry(p => [...p, item].sort());
                              setPantryShoppingItems(p => p.filter(i => i !== item));
                            }
                            if (nowChecked && snackShoppingList.includes(item)) {
                              setSnacks(p => [...p, item]);
                              setSnackShoppingList(p => p.filter(i => i !== item));
                            }
                          }}
                        >
                          <div className={`shop-check ${shoppingChecked[item] ? "on" : ""}`} style={inPantry ? { borderColor: "#4a7c59" } : {}}>
                            {shoppingChecked[item] && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><polyline points="1,4.5 4,7.5 10,1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                          </div>
                          <span className={`shop-item-name ${shoppingChecked[item] ? "checked" : ""}`}>{item}</span>
                          {inPantry && <span className="pantry-badge">🫙 in pantry</span>}
                          {pantryShoppingItems.includes(item) && !inPantry && <span className="pantry-badge" style={{ background: "#fef3c7", color: "#92400e" }}>🛒 restock</span>}
                          {snackShoppingList.includes(item) && <span className="pantry-badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>🍿 snack</span>}
                        </div>
                      );
                    })}
                </>
              )}
            </>
          )}

          {/* ── SUGGEST ── */}
          {view === "suggest" && (
            <>
              <div className="suggest-intro">
                <h2>✨ Meal Suggestions</h2>
                <p>Based on what your family loves, I'll suggest new meals you'll actually cook.</p>
                <input
                  className="goal-input"
                  placeholder="e.g. quick weeknight dinners, high protein, freezer batch..."
                  value={aiGoal}
                  onChange={e => setAiGoal(e.target.value)}
                />
                <button className="suggest-btn" onClick={getSuggestions} disabled={aiLoading}>
                  {aiLoading ? "Finding ideas..." : "✨ Get Suggestions"}
                </button>
              </div>

              <div className="top-meals">
                <div className="section-title" style={{ fontSize: "16px", marginBottom: "10px" }}>Your family's favourites</div>
                {topMeals.map((m, i) => (
                  <div key={m.id} className="top-meal-row">
                    <span className="top-rank">{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span>
                    <span className="top-name">{m.name}</span>
                    <span className="top-count">cooked {m.cookCount}×</span>
                  </div>
                ))}
              </div>

              {aiLoading && (
                <div className="loading-dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
              )}

              {aiSuggestions.map((s, i) => {
                const alreadyAdded = meals.some(m => m.name === s.name);
                return (
                  <div key={i} className="suggestion-card">
                    <div className="sug-name">{s.name}</div>
                    <div className="sug-why">{s.why}</div>
                    <div className="sug-tags">
                      {(s.tags || []).map(t => <span key={t} className="cell-tag" style={{ background: TAG_COLORS[t]?.bg || "#f3f4f6", color: TAG_COLORS[t]?.text || "#374151", padding: "3px 8px", borderRadius: "999px", fontSize: "11px" }}>{t}</span>)}
                    </div>
                    <button className={`sug-add-btn ${alreadyAdded ? "added" : ""}`} onClick={() => !alreadyAdded && addSuggestedMeal(s)}>
                      {alreadyAdded ? "✓ Added to Meal Bank" : "+ Add to Meal Bank"}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Save to drawer popover */}
      {saveLeftoverPopover && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 590 }} onClick={() => setSaveLeftoverPopover(null)} />
          <div className="leftover-popover" style={{ top: Math.min(saveLeftoverPopover.y, window.innerHeight - 260), left: Math.min(saveLeftoverPopover.x - 80, window.innerWidth - 240) }}>
            <div className="leftover-popover-title">Save to Fridge & Freezer</div>
            <div className="leftover-popover-name">"{saveLeftoverPopover.meal.name}"</div>
            <div className="leftover-type-row">
              <button className={`leftover-type-btn ${saveLeftoverPopover.type === "leftover" ? "sel-lo" : ""}`}
                onClick={() => setSaveLeftoverPopover(p => ({ ...p, type: "leftover" }))}>🍱 Leftover</button>
              <button className={`leftover-type-btn ${saveLeftoverPopover.type === "freezer" ? "sel-fr" : ""}`}
                onClick={() => setSaveLeftoverPopover(p => ({ ...p, type: "freezer" }))}>❄️ Freeze it</button>
            </div>
            <div className="leftover-portions-row">
              <span className="leftover-portions-label">Portions</span>
              <button className="portions-btn" onClick={() => setSaveLeftoverPopover(p => ({ ...p, portions: Math.max(1, p.portions - 1) }))}>−</button>
              <span className="portions-val">{saveLeftoverPopover.portions}</span>
              <button className="portions-btn" onClick={() => setSaveLeftoverPopover(p => ({ ...p, portions: p.portions + 1 }))}>+</button>
            </div>
            <button className="leftover-save-btn" onClick={saveToDrawer}>Save to drawer</button>
            <button className="leftover-cancel-btn" onClick={() => setSaveLeftoverPopover(null)}>cancel</button>
          </div>
        </>
      )}

      {/* Restore to drawer toast */}
      {restorePrompt && (
        <div className="restore-toast">
          <div className="restore-toast-title">Put it back?</div>
          <div className="restore-toast-name">"{restorePrompt.meal.name}"</div>
          <div className="restore-toast-btns" style={{ flexDirection: "column", gap: "6px" }}>
            <button className="restore-yes" onClick={confirmAddToWeek}>
              📝 Back to This Week
            </button>
            {restorePrompt.meal.isInventory && (
              <button className="restore-yes" style={{ background: "#6b8fba" }} onClick={confirmRestore}>
                {restorePrompt.meal.invType === "freezer" ? "❄️ Back to freezer" : "🍱 Back to fridge"}
              </button>
            )}
            <button className="restore-no" onClick={() => setRestorePrompt(null)}>No thanks</button>
          </div>
        </div>
      )}

      {/* Snacks FAB */}
      <button className="snacks-fab" onClick={() => setSnacksOpen(true)}>
        🍿 Snacks
        <span className="snacks-count">{snacks.length}</span>
      </button>

      {/* Snacks Drawer */}
      {snacksOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setSnacksOpen(false)} />
          <div className="snacks-drawer">
            <div className="snacks-header">
              <div className="snacks-title">🍿 Snacks</div>
              <button className="drawer-close" onClick={() => setSnacksOpen(false)}>×</button>
            </div>
            <div className="snacks-body">
              <div className="snacks-add-row">
                <input
                  className="snacks-input"
                  placeholder="Add a snack..."
                  value={newSnack}
                  onChange={e => setNewSnack(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && newSnack.trim()) {
                      setSnacks(p => [...p, newSnack.trim()]);
                      setNewSnack("");
                    }
                  }}
                  autoFocus
                />
                <button className="snacks-add-btn" onClick={() => {
                  if (newSnack.trim()) { setSnacks(p => [...p, newSnack.trim()]); setNewSnack(""); }
                }}>+</button>
              </div>
              {snacks.length === 0 && snackShoppingList.length === 0 ? (
                <div className="snacks-empty">
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🍿</div>
                  No snacks listed — add what you've got!
                </div>
              ) : (
                <>
                  {snacks.length > 0 && (
                    <>
                      <div className="snacks-section-label">✅ We have ({snacks.length})</div>
                      {snacks.map((snack, i) => (
                        <div key={i} className="snack-item">
                          <span className="snack-item-emoji">🍬</span>
                          <span className="snack-item-name">{snack}</span>
                          <button className="snack-item-buy" onClick={() => {
                            setSnackShoppingList(p => [...p, snack]);
                            setSnacks(p => p.filter((_, j) => j !== i));
                          }}>🛒 Need more</button>
                          <button className="snack-item-remove" onClick={() => setSnacks(p => p.filter((_, j) => j !== i))}>×</button>
                        </div>
                      ))}
                    </>
                  )}
                  {snackShoppingList.length > 0 && (
                    <>
                      <div className="snacks-section-label">🛒 Need to buy ({snackShoppingList.length})</div>
                      {snackShoppingList.map((snack, i) => (
                        <div key={i} className="snack-shop-item">
                          <span className="snack-item-emoji">🍬</span>
                          <span className="snack-shop-name">{snack}</span>
                          <button className="snack-shop-got" onClick={() => {
                            setSnacks(p => [...p, snack]);
                            setSnackShoppingList(p => p.filter((_, j) => j !== i));
                          }}>✓ Got it</button>
                          <button className="snack-item-remove" onClick={() => setSnackShoppingList(p => p.filter((_, j) => j !== i))}>×</button>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Pantry FAB */}
      <button className="pantry-fab" onClick={() => setPantryOpen(true)}>
        🫙 Pantry
        <span className="pantry-count">{pantry.length}</span>
      </button>

      {/* Pantry Drawer */}
      {pantryOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setPantryOpen(false)} />
          <div className="pantry-drawer">
            <div className="pantry-header">
              <div className="pantry-title">🫙 My Pantry</div>
              <button className="drawer-close" onClick={() => setPantryOpen(false)}>×</button>
            </div>
            <div className="pantry-body">
              <p className="pantry-intro">
                Items here are automatically marked on your shopping list so you know you don't need to buy them.
              </p>
              <div className="pantry-add-row">
                <input
                  className="pantry-input"
                  placeholder="Add an item (e.g. olive oil)"
                  value={newPantryItem}
                  onChange={e => setNewPantryItem(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && newPantryItem.trim()) {
                      const item = newPantryItem.trim().toLowerCase();
                      if (!pantry.includes(item)) setPantry(p => [...p, item].sort());
                      setNewPantryItem("");
                    }
                  }}
                  autoFocus
                />
                <button className="pantry-add-btn" onClick={() => {
                  const item = newPantryItem.trim().toLowerCase();
                  if (item && !pantry.includes(item)) setPantry(p => [...p, item].sort());
                  setNewPantryItem("");
                }}>+</button>
              </div>
              <div className="pantry-section-label">🫙 {pantry.length} staples</div>
              {pantry.length === 0 && (
                <div style={{ fontSize: "13px", color: "#8aaa94", padding: "12px 0" }}>No pantry items yet — add things you always have at home.</div>
              )}
              {pantry.map(item => {
                const onList = pantryShoppingItems.includes(item);
                return (
                  <div key={item} className="pantry-item">
                    <span className="pantry-item-name">{item}</span>
                    <button
                      className={`pantry-item-buy ${onList ? "added" : ""}`}
                      onClick={() => {
                        if (!onList) {
                          setPantryShoppingItems(p => [...p, item]);
                          setPantry(p => p.filter(i => i !== item));
                        }
                      }}
                    >
                      {onList ? "✓ On list" : "🛒 Need to buy"}
                    </button>
                    <button className="pantry-item-remove" onClick={() => setPantry(p => p.filter(i => i !== item))}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* FAB */}
      <button className="drawer-fab" onClick={() => setDrawerOpen(true)}>
        🧊 Fridge & Freezer
        {inventory.length > 0 && <span className="inv-count">{inventory.length}</span>}
      </button>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <div className="drawer-title">🧊 Fridge & Freezer</div>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <div className="drawer-body">
              <p style={{ fontSize: "13px", color: "#8a7060", marginBottom: "12px" }}>
                Track leftovers and frozen meals. They'll be suggested first when you plan your week.
              </p>

              {/* Leftovers */}
              <div className="inv-section-label">🍱 Leftovers</div>
              {inventory.filter(i => i.type === "leftover").length === 0 && (
                <div style={{ fontSize: "13px", color: "#b8a898", padding: "8px 0" }}>No leftovers logged</div>
              )}
              {inventory.filter(i => i.type === "leftover").map(item => (
                <div key={item.id} className="inv-item leftover" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="inv-icon">🍱</div>
                    <div className="inv-info" style={{ flex: 1 }}>
                      <div className="inv-name">{item.name}</div>
                      <div className="inv-slots">
                        {(item.mealTypes || []).map(s => <span key={s} className="inv-slot-tag">{SLOT_ICONS[s]} {s}</span>)}
                      </div>
                      <div className="portions-ctrl">
                        <button className="portions-btn" onClick={() => setInventory(p => p.map(i => i.id === item.id ? { ...i, portions: Math.max(1, i.portions - 1) } : i))}>−</button>
                        <span className="portions-val">{item.portions}</span>
                        <button className="portions-btn" onClick={() => setInventory(p => p.map(i => i.id === item.id ? { ...i, portions: i.portions + 1 } : i))}>+</button>
                        <span style={{ fontSize: "11px", color: "#a89070" }}>portions</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                      <button className={`plan-it-btn ${planningItem?.id === item.id ? "active" : ""}`}
                        onClick={() => setPlanningItem(planningItem?.id === item.id ? null : item)}>
                        {planningItem?.id === item.id ? "Cancel" : "Plan it →"}
                      </button>
                      <button className="inv-remove" style={{ opacity: 1 }} onClick={() => removeInventoryItem(item.id)}>×</button>
                    </div>
                  </div>
                  {planningItem?.id === item.id && <PlanItGrid item={item} plan={plan} onPlan={planIntoWeek} onClose={() => setPlanningItem(null)} />}
                </div>
              ))}

              {/* Freezer */}
              <div className="inv-section-label" style={{ marginTop: "16px" }}>❄️ Freezer</div>
              {inventory.filter(i => i.type === "freezer").length === 0 && (
                <div style={{ fontSize: "13px", color: "#b8a898", padding: "8px 0" }}>Nothing in the freezer</div>
              )}
              {inventory.filter(i => i.type === "freezer").map(item => (
                <div key={item.id} className="inv-item freezer" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="inv-icon">❄️</div>
                    <div className="inv-info" style={{ flex: 1 }}>
                      <div className="inv-name">{item.name}</div>
                      <div className="inv-slots">
                        {(item.mealTypes || []).map(s => <span key={s} className="inv-slot-tag">{SLOT_ICONS[s]} {s}</span>)}
                      </div>
                      <div className="portions-ctrl">
                        <button className="portions-btn" onClick={() => setInventory(p => p.map(i => i.id === item.id ? { ...i, portions: Math.max(1, i.portions - 1) } : i))}>−</button>
                        <span className="portions-val">{item.portions}</span>
                        <button className="portions-btn" onClick={() => setInventory(p => p.map(i => i.id === item.id ? { ...i, portions: i.portions + 1 } : i))}>+</button>
                        <span style={{ fontSize: "11px", color: "#a89070" }}>portions</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                      <button className={`plan-it-btn ${planningItem?.id === item.id ? "active" : ""}`}
                        onClick={() => setPlanningItem(planningItem?.id === item.id ? null : item)}>
                        {planningItem?.id === item.id ? "Cancel" : "Plan it →"}
                      </button>
                      <button className="inv-remove" style={{ opacity: 1 }} onClick={() => removeInventoryItem(item.id)}>×</button>
                    </div>
                  </div>
                  {planningItem?.id === item.id && <PlanItGrid item={item} plan={plan} onPlan={planIntoWeek} onClose={() => setPlanningItem(null)} />}
                </div>
              ))}

              {/* Add form */}
              {addingInv ? (
                <div className="inv-form">
                  <div className="inv-type-row">
                    <button className={`inv-type-btn ${newInvItem.type === "leftover" ? "sel-leftover" : ""}`} onClick={() => setNewInvItem(p => ({ ...p, type: "leftover" }))}>🍱 Leftover</button>
                    <button className={`inv-type-btn ${newInvItem.type === "freezer" ? "sel-freezer" : ""}`} onClick={() => setNewInvItem(p => ({ ...p, type: "freezer" }))}>❄️ Freezer</button>
                  </div>
                  <input className="form-input" style={{ marginBottom: "8px" }} placeholder={newInvItem.type === "leftover" ? "e.g. Leftover Pasta Bake" : "e.g. Frozen Bolognese"} value={newInvItem.name} onChange={e => setNewInvItem(p => ({ ...p, name: e.target.value }))} autoFocus />
                  <div className="form-label" style={{ marginBottom: "6px" }}>Suitable for</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                    {SLOTS.map(s => (
                      <button key={s} className={`form-tag ${newInvItem.mealTypes.includes(s) ? "sel" : ""}`}
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                        onClick={() => setNewInvItem(p => ({ ...p, mealTypes: p.mealTypes.includes(s) ? p.mealTypes.filter(x => x !== s) : [...p.mealTypes, s] }))}>
                        {SLOT_ICONS[s]} {s}
                      </button>
                    ))}
                  </div>
                  <div className="form-label" style={{ marginBottom: "6px" }}>Portions</div>
                  <div className="portions-ctrl" style={{ marginBottom: "12px" }}>
                    <button className="portions-btn" onClick={() => setNewInvItem(p => ({ ...p, portions: Math.max(1, p.portions - 1) }))}>−</button>
                    <span className="portions-val">{newInvItem.portions}</span>
                    <button className="portions-btn" onClick={() => setNewInvItem(p => ({ ...p, portions: p.portions + 1 }))}>+</button>
                  </div>
                  <div className="form-row">
                    <button className="discard-btn" onClick={() => setAddingInv(false)}>Cancel</button>
                    <button className="save-btn" onClick={addInventoryItem}>Save</button>
                  </div>
                </div>
              ) : (
                <button className="add-inv-btn" onClick={() => setAddingInv(true)}>+ Add leftover or freezer meal</button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Meal Picker Overlay */}
      {selecting && (
        <div className="overlay" onClick={() => setSelecting(null)}>
          <div className="picker" onClick={e => e.stopPropagation()}>
            <div className="picker-title">{SLOT_ICONS[selecting.slot]} {selecting.slot} — {selecting.day}</div>
            <input className="picker-search" placeholder={`Search ${selecting.slot.toLowerCase()} meals...`} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            <div className="tag-scroll">
              {TAGS.map(t => (
                <button key={t} className={`tag-pill ${filterTag === t ? "active" : ""}`} onClick={() => setFilterTag(filterTag === t ? null : t)}>{t}</button>
              ))}
            </div>
            <div className="meals-scroll">
              {/* Inventory suggestions at the top */}
              {matchingInventory.length > 0 && (
                <div className="picker-inv-section">
                  <div className="picker-inv-label">✨ Use up first</div>
                  {matchingInventory.map(item => (
                    <div
                      key={item.id}
                      className={`picker-inv-item ${item.type === "leftover" ? "leftover-item" : "freezer-item"}`}
                      onClick={() => useInventoryItem(item)}
                    >
                      <span style={{ fontSize: "18px" }}>{item.type === "leftover" ? "🍱" : "❄️"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#2d2416" }}>{item.name}</div>
                        <div style={{ fontSize: "11px", color: "#a89070" }}>{item.portions} portion{item.portions !== 1 ? "s" : ""} available</div>
                      </div>
                      <span className={`picker-inv-badge ${item.type === "leftover" ? "lo" : "fr"}`}>
                        {item.type === "leftover" ? "Leftover" : "Frozen"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {filteredMeals.length === 0 && matchingInventory.length === 0 && (
                <div style={{ textAlign: "center", color: "#a89070", padding: "24px 20px", fontSize: "14px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{SLOT_ICONS[selecting.slot]}</div>
                  No {selecting.slot.toLowerCase()} meals yet —<br/>add some in the Meal Bank!
                </div>
              )}
              {filteredMeals.map(m => (
                <div key={m.id} className="meal-pick-item" onClick={() => assignMeal(m)}>
                  <div className="meal-pick-name">{m.name}</div>
                  <span className="cook-count">×{m.cookCount}</span>
                </div>
              ))}
            </div>
            <button className="cancel-btn" onClick={() => setSelecting(null)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
