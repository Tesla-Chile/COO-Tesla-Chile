const fuelTypes = {
  bencina93: { label: "Bencina 93", price: 1436 },
  bencina95: { label: "Bencina 95", price: 1485 },
  bencina97: { label: "Bencina 97", price: 1534 },
  diesel: { label: "Diesel", price: 1207 },
};

const teslaModels = {
  "model3-rwd": { model: "Model 3", version: "RWD", efficiency: 7.69 },
  "model3-premium-rwd": { model: "Model 3", version: "Premium RWD", efficiency: 7.25 },
  "model3-premium-lr-rwd": { model: "Model 3", version: "Premium LR RWD", efficiency: 7.35 },
  "model3-premium-lr-awd": { model: "Model 3", version: "Premium LR AWD", efficiency: 6.99 },
  "model3-performance-awd": { model: "Model 3", version: "Performance AWD", efficiency: 6.06 },
  "modely-premium-rwd": { model: "Model Y", version: "Premium RWD", efficiency: 7.19 },
  "modely-premium-lr-rwd": { model: "Model Y", version: "Premium LR RWD", efficiency: 7.14 },
  "modely-premium-lr-awd": { model: "Model Y", version: "Premium LR AWD", efficiency: 6.62 },
};

const defaults = {
  kmYear: 20000,
  efficiency: 10,
  fuelType: "bencina95",
  kwhPrice: 233,
  teslaModel: "model3-rwd",
  maintenanceCount: 3,
  maintenanceCost: 350000,
  permit: 1000000,
  teslaPermit: 220000,
  insurance: 90000,
  teslaInsurance: 70000,
};

const viewCopy = {
  energia: {
    heading: "Comparación del Ahorro Mensual entre Electricidad y Combustible",
    chart: "Gasto Mensual en Energía",
    monthly: "Ahorro Mensual",
    annual: "Ahorro Anual",
    note: "Se utiliza el costo promedio del kWh en Santiago: $233 CLP, editable en los supuestos.",
  },
  mantencion: {
    heading: "Comparación de los Costos de Mantenimiento entre Vehículos de Combustión y Tesla",
    chart: "Gasto Mensual en Mantenciones",
    monthly: "Ahorro Mensual",
    annual: "Ahorro Anual",
    note: "Los vehículos Tesla no requieren una pauta de mantenciones.",
  },
  total: {
    heading: "Ahorro Estimado al Cambiar de un Vehículo de Combustión a Tesla",
    chart: "Gasto Mensual Total",
    monthly: "Ahorro Mensual Total",
    annual: "Ahorro Anual Total",
    note: "Incluye energía, mantenciones, permiso de circulación y seguro mensual.",
  },
};

const assumptionViews = {
  energia: {
    heading: "Supuestos de Energía",
    visible: ["energia"],
  },
  mantencion: {
    heading: "Supuestos de Mantención",
    visible: ["mantencion"],
  },
  total: {
    heading: "Costos Generales",
    visible: ["general"],
  },
};

const state = { ...defaults, activeView: "energia" };
const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });

function compactClp(value, options = {}) {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1000000) {
    const millions = absValue / 1000000;
    const formatted = new Intl.NumberFormat("es-CL", {
      minimumFractionDigits: options.forceMillionDecimal ? 2 : 0,
      maximumFractionDigits: options.forceMillionDecimal ? 2 : millions >= 10 ? 0 : 1,
    }).format(millions);
    return `${sign}$${formatted} mill`;
  }

  if (absValue >= 1000) {
    return `${sign}$${number.format(Math.round(absValue / 1000))} mil`;
  }

  return `${sign}${clp.format(absValue)}`;
}

const controls = {
  kmYear: document.querySelector("#kmYear"),
  efficiency: document.querySelector("#efficiency"),
  fuelType: document.querySelector("#fuelType"),
  kwhPrice: document.querySelector("#kwhPrice"),
  teslaModel: document.querySelector("#teslaModel"),
  maintenanceCount: document.querySelector("#maintenanceCount"),
  maintenanceCost: document.querySelector("#maintenanceCost"),
  permit: document.querySelector("#permit"),
  teslaPermit: document.querySelector("#teslaPermit"),
  insurance: document.querySelector("#insurance"),
  teslaInsurance: document.querySelector("#teslaInsurance"),
};

const nodes = {
  title: document.querySelector("#view-title"),
  chartTitle: document.querySelector("#chart-title"),
  sourceNote: document.querySelector("#source-note"),
  monthlyLabel: document.querySelector("#monthly-label"),
  annualLabel: document.querySelector("#annual-label"),
  headlineSaving: document.querySelector("#headline-saving"),
  monthlySaving: document.querySelector("#monthly-saving"),
  annualSaving: document.querySelector("#annual-saving"),
  combustionValue: document.querySelector("#combustion-value"),
  teslaValue: document.querySelector("#tesla-value"),
  combustionBar: document.querySelector("#combustion-bar"),
  teslaBar: document.querySelector("#tesla-bar"),
  kmOutput: document.querySelector("#km-output"),
  efficiencyOutput: document.querySelector("#efficiency-output"),
  fuelPriceOutput: document.querySelector("#fuel-price-output"),
  kwhOutput: document.querySelector("#kwh-output"),
  teslaEfficiencyOutput: document.querySelector("#tesla-efficiency-output"),
  maintenanceCountOutput: document.querySelector("#maintenance-count-output"),
  maintenanceCostOutput: document.querySelector("#maintenance-cost-output"),
  permitOutput: document.querySelector("#permit-output"),
  teslaPermitOutput: document.querySelector("#tesla-permit-output"),
  insuranceOutput: document.querySelector("#insurance-output"),
  teslaInsuranceOutput: document.querySelector("#tesla-insurance-output"),
  assumptionsHeading: document.querySelector("#assumptions-heading"),
  assumptionsLayout: document.querySelector("#assumptions-layout"),
  assumptionPanels: document.querySelectorAll("[data-assumption]"),
  mobileNext: document.querySelector("#mobile-next"),
};

const viewOrder = ["energia", "mantencion", "total"];
const nextViewLabels = {
  energia: "Siguiente página: Mantención",
  mantencion: "Siguiente página: Total",
};

function calculateCosts() {
  const monthlyKm = state.kmYear / 12;
  const fuel = fuelTypes[state.fuelType];
  const teslaModel = teslaModels[state.teslaModel];
  const combustionEnergy = state.efficiency > 0 ? (monthlyKm / state.efficiency) * fuel.price : 0;
  const teslaEnergy = (monthlyKm / teslaModel.efficiency) * state.kwhPrice;
  const combustionMaintenance = (state.maintenanceCount * state.maintenanceCost) / 12;
  const teslaMaintenance = 0;
  const combustionPermit = state.permit / 12;
  const teslaPermit = state.teslaPermit / 12;

  const views = {
    energia: {
      combustion: combustionEnergy,
      tesla: teslaEnergy,
    },
    mantencion: {
      combustion: combustionMaintenance,
      tesla: teslaMaintenance,
    },
    total: {
      combustion: combustionEnergy + combustionMaintenance + state.insurance + combustionPermit,
      tesla: teslaEnergy + teslaMaintenance + state.teslaInsurance + teslaPermit,
    },
  };

  return views[state.activeView];
}

function updateControls() {
  const fuel = fuelTypes[state.fuelType];
  const teslaModel = teslaModels[state.teslaModel];
  nodes.kmOutput.textContent = `${number.format(state.kmYear)} km`;
  nodes.efficiencyOutput.textContent = `${number.format(state.efficiency)} km/L`;
  nodes.fuelPriceOutput.textContent = `${clp.format(fuel.price)}/l`;
  nodes.kwhOutput.textContent = clp.format(state.kwhPrice);
  nodes.teslaEfficiencyOutput.textContent = `${number.format(teslaModel.efficiency)} km/kWh`;
  nodes.maintenanceCountOutput.textContent = number.format(state.maintenanceCount);
  nodes.maintenanceCostOutput.textContent = compactClp(state.maintenanceCost);
  nodes.permitOutput.textContent = compactClp(state.permit, { forceMillionDecimal: true });
  nodes.teslaPermitOutput.textContent = compactClp(state.teslaPermit, { forceMillionDecimal: true });
  nodes.insuranceOutput.textContent = compactClp(state.insurance);
  nodes.teslaInsuranceOutput.textContent = compactClp(state.teslaInsurance);

  Object.entries(controls).forEach(([key, control]) => {
    if (control.type === "range") {
      control.value = state[key];
      updateRangeFill(control);
    }
  });
}

function updateView() {
  const copy = viewCopy[state.activeView];
  const costs = calculateCosts();
  const max = Math.max(costs.combustion, costs.tesla, 1);
  const monthlySaving = costs.combustion - costs.tesla;
  const annualSaving = monthlySaving * 12;

  nodes.title.textContent = copy.heading;
  nodes.chartTitle.textContent = copy.chart;
  nodes.sourceNote.textContent = copy.note;
  nodes.monthlyLabel.textContent = copy.monthly;
  nodes.annualLabel.textContent = copy.annual;
  nodes.combustionValue.textContent = compactClp(costs.combustion);
  nodes.teslaValue.textContent = compactClp(costs.tesla);
  nodes.monthlySaving.textContent = compactClp(monthlySaving);
  nodes.annualSaving.textContent = compactClp(annualSaving);
  nodes.headlineSaving.textContent = compactClp(calculateTotalAnnualSaving());
  nodes.combustionBar.style.height = `${Math.max((costs.combustion / max) * 100, 3)}%`;
  nodes.teslaBar.style.height = `${Math.max((costs.tesla / max) * 100, 3)}%`;

  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === state.activeView);
  });

  updateMobileNext();
  updateAssumptionsVisibility();
}

function updateMobileNext() {
  const nextLabel = nextViewLabels[state.activeView];
  nodes.mobileNext.hidden = !nextLabel;
  if (nextLabel) nodes.mobileNext.textContent = nextLabel;
}

function updateAssumptionsVisibility() {
  const settings = assumptionViews[state.activeView];
  nodes.assumptionsHeading.textContent = settings.heading;
  nodes.assumptionsLayout.classList.toggle("is-focused", settings.visible.length === 1);

  nodes.assumptionPanels.forEach((panel) => {
    panel.hidden = !settings.visible.includes(panel.dataset.assumption);
  });
}

function calculateTotalAnnualSaving() {
  const previousView = state.activeView;
  state.activeView = "total";
  const total = calculateCosts();
  state.activeView = previousView;
  return (total.combustion - total.tesla) * 12;
}

function render() {
  updateControls();
  updateView();
}

function parseEditableNumber(value) {
  const normalized = String(value).trim().toLowerCase();
  const multiplier = normalized.includes("mill")
    ? 1000000
    : normalized.includes("mil")
      ? 1000
      : 1;
  const numericText = normalized
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  return Number(numericText) * multiplier;
}

function updateRangeFill(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.setProperty("--fill", `${Math.min(100, Math.max(0, percent))}%`);
}

function setupEditableOutputs() {
  const editableOutputs = [
    { key: "kmYear", node: nodes.kmOutput, control: controls.kmYear },
    { key: "efficiency", node: nodes.efficiencyOutput, control: controls.efficiency },
    { key: "kwhPrice", node: nodes.kwhOutput, control: controls.kwhPrice },
    { key: "maintenanceCount", node: nodes.maintenanceCountOutput, control: controls.maintenanceCount },
    { key: "maintenanceCost", node: nodes.maintenanceCostOutput, control: controls.maintenanceCost },
    { key: "permit", node: nodes.permitOutput, control: controls.permit },
    { key: "teslaPermit", node: nodes.teslaPermitOutput, control: controls.teslaPermit },
    { key: "insurance", node: nodes.insuranceOutput, control: controls.insurance },
    { key: "teslaInsurance", node: nodes.teslaInsuranceOutput, control: controls.teslaInsurance },
  ].filter((item) => item.node && item.control);

  editableOutputs.forEach(({ key, node, control }) => {
    node.classList.add("editable-output");
    node.tabIndex = 0;
    node.setAttribute("role", "button");
    node.setAttribute("aria-label", "Editar valor");

    const openEditor = () => {
      if (node.querySelector("input")) return;

      const editor = document.createElement("input");
      editor.className = "inline-number-input";
      editor.inputMode = "decimal";
      editor.value = state[key];
      editor.setAttribute("aria-label", "Nuevo valor");

      node.textContent = "";
      node.append(editor);
      editor.focus();
      editor.select();

      let finished = false;
      const finish = (shouldSave) => {
        if (finished) return;
        finished = true;

        if (shouldSave) {
          const parsed = parseEditableNumber(editor.value);
          if (Number.isFinite(parsed)) {
            const min = Number(control.min);
            const max = Number(control.max);
            const boundedValue = Math.min(max, Math.max(min, parsed));
            state[key] = boundedValue;
            control.value = boundedValue;
            updateRangeFill(control);
          }
        }

        render();
      };

      editor.addEventListener("blur", () => finish(true));
      editor.addEventListener("click", (event) => event.stopPropagation());
      editor.addEventListener("keydown", (event) => {
        event.stopPropagation();

        if (event.key === "Enter") {
          event.preventDefault();
          finish(true);
        }

        if (event.key === "Escape") {
          event.preventDefault();
          finish(false);
        }
      });
    };

    node.addEventListener("click", openEditor);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEditor();
      }
    });
  });
}

Object.entries(controls).forEach(([key, input]) => {
  input.addEventListener("input", (event) => {
    if (input.type === "range") {
      state[key] = Number(event.target.value);
      updateRangeFill(input);
    } else {
      state[key] = event.target.value;
    }

    render();
  });
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    render();
  });
});

document.querySelector("#reset-button").addEventListener("click", () => {
  Object.assign(state, defaults);
  Object.entries(defaults).forEach(([key, value]) => {
    if (controls[key]) controls[key].value = value;
  });
  render();
});

nodes.mobileNext.addEventListener("click", () => {
  const currentIndex = viewOrder.indexOf(state.activeView);
  const nextView = viewOrder[currentIndex + 1];
  if (!nextView) return;

  state.activeView = nextView;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

setupEditableOutputs();
render();
