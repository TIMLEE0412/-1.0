import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";

const STORAGE_KEY = "tstage-node-editor";

const navItems = [
  { icon: "add", label: "新建" },
  { icon: "edit_note", label: "工作流" },
  { icon: "inventory_2", label: "资产库" },
  { icon: "extension", label: "插件" },
  { icon: "image", label: "图片" },
  { icon: "terminal", label: "指令" },
  { icon: "crop_free", label: "视图" },
];

const topTabs = ["工作流", "资源库", "团队协作"];
const panelTabs = ["外观主题", "画布背景", "连接样式"];
const historyTabs = ["历史记录", "队列任务", "素材库", "批注"];

const colors = [
  { name: "焰橙", value: "#ff6b2c" },
  { name: "青绿", value: "#14b8a6" },
  { name: "海蓝", value: "#2563eb" },
  { name: "紫罗兰", value: "#9333ea" },
  { name: "银白", value: "#f4f4f5" },
];

const canvasBackgrounds = [
  { id: "grid", label: "动态网格" },
  { id: "plain", label: "纯色纸张" },
  { id: "dots", label: "细点纹理" },
];

const lineStyles = [
  { id: "dashed", label: "虚线连接" },
  { id: "solid", label: "实线连接" },
  { id: "soft", label: "浅色连接" },
];

const sampleOutputs = [
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=85",
];

const aspectRatios = ["1:1", "4:3", "3:4", "16:9", "9:16", "21:9"];
const imageSizes = ["1K", "2K", "4K"];
const videoDurations = ["5s", "8s", "10s"];
const videoResolutions = ["480p", "720p", "1080p"];

const modelOptions = {
  image: [
    { name: "Flux.1 Pro", detail: "高质量商业图像，适合视觉稿" },
    { name: "SDXL Turbo", detail: "快速出图，适合草稿探索" },
    { name: "Midjourney Style", detail: "强风格化、氛围感更强" },
  ],
  video: [
    { name: "Sora Storyboard", detail: "镜头运动和故事板预览" },
    { name: "Runway Gen-3", detail: "短片动效和氛围镜头" },
    { name: "Kling Preview", detail: "图生视频动线测试" },
  ],
  audio: [
    { name: "Eleven Voice", detail: "旁白、人声试听" },
    { name: "Suno Bed", detail: "背景音乐草稿" },
    { name: "Foley Lab", detail: "环境音和拟音素材" },
  ],
};

const defaultPrompt =
  "Ultra-minimal fashion photography, high-contrast chiaroscuro lighting, tactile fabric textures, muted earth tones, cinematic composition.";

const defaultNodes = [
  { id: "prompt-1", type: "prompt", title: "Prompt 节点", x: 0, y: 0, prompt: defaultPrompt },
  {
    id: "image-1",
    type: "image",
    title: "Image",
    x: 40,
    y: 330,
    image: sampleOutputs[1],
    caption: "参考图",
    prompt: "描述你想生成的画面，按 @ 引用素材",
    model: "Flux.1 Pro",
    ratio: "16:9",
    size: "2K",
    count: 2,
    refs: {},
  },
  {
    id: "video-1",
    type: "video",
    title: "Video",
    x: 720,
    y: 190,
    image: sampleOutputs[2],
    caption: "视频草稿",
    prompt: "描述你想生成的视频内容，按 @ 引用素材",
    model: "Sora Storyboard",
    ratio: "16:9",
    resolution: "480p",
    duration: "5s",
    count: 1,
    refs: {},
  },
  { id: "process-1", type: "process", title: "生成节点", x: 460, y: 0 },
  { id: "output-1", type: "output", title: "输出结果", x: 1420, y: 40, image: sampleOutputs[0] },
  { id: "note-1", type: "note", title: "创作笔记", x: 1600, y: 620, note: "下一轮降低高光强度，保留织物纹理和暗部层次。" },
];

const defaultEdges = [
  { id: "edge-1", from: "prompt-1", to: "process-1" },
  { id: "edge-2", from: "image-1", to: "process-1" },
  { id: "edge-3", from: "video-1", to: "process-1" },
  { id: "edge-4", from: "process-1", to: "output-1" },
  { id: "edge-5", from: "output-1", to: "note-1" },
];

function nowLabel() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeNode(node) {
  const next = { ...node };
  if (next.type === "image") {
    next.prompt ??= "描述你想生成的画面，按 @ 引用素材";
    next.model ??= "Flux.1 Pro";
    next.ratio ??= "16:9";
    next.size ??= "2K";
    next.count ??= 1;
    next.refs ??= {};
    next.composerOpen ??= true;
  }
  if (next.type === "video") {
    next.prompt ??= "描述你想生成的视频内容，按 @ 引用素材";
    next.model ??= "Sora Storyboard";
    next.ratio ??= "16:9";
    next.resolution ??= "480p";
    next.duration ??= "5s";
    next.count ??= 1;
    next.refs ??= {};
    next.composerOpen ??= true;
  }
  return next;
}

const App = {
  data() {
    const saved = this.loadSavedState();
    return {
      navItems,
      topTabs,
      panelTabs,
      historyTabs,
      colors,
      canvasBackgrounds,
      lineStyles,
      aspectRatios,
      imageSizes,
      videoDurations,
      videoResolutions,
      modelOptions,
      activeNav: saved.activeNav || "工作流",
      activeTopTab: saved.activeTopTab || "工作流",
      activeView: saved.activeView || "canvas",
      activePanelTab: saved.activePanelTab || "外观主题",
      activeHistoryTab: "历史记录",
      activeTool: saved.activeTool || "image",
      activeActionPanel: "",
      modelPickerOpen: false,
      modelPickerTool: "image",
      selectedModels: saved.selectedModels || {
        image: "Flux.1 Pro",
        video: "Sora Storyboard",
        audio: "Eleven Voice",
      },
      accentColor: saved.accentColor || "#ff6b2c",
      canvasBackground: saved.canvasBackground || "grid",
      lineStyle: saved.lineStyle || "dashed",
      showGrid: saved.showGrid ?? true,
      snapGuide: saved.snapGuide ?? false,
      showCustomPanel: saved.showCustomPanel ?? false,
      historyOpen: saved.historyOpen ?? true,
      mobileMenuOpen: false,
      previewOpen: false,
      isGenerating: false,
      showTopProgress: true,
      progress: saved.progress || 65,
      statusText: saved.statusText || "等待下一次生成",
      toast: "",
      projectName: saved.projectName || "T-Stage 试用项目",
      savedAt: saved.savedAt || "",
      nodes: (saved.nodes || clone(defaultNodes)).map(normalizeNode),
      edges: saved.edges || clone(defaultEdges),
      pendingConnection: "",
      selectedNodeId: saved.selectedNodeId || "prompt-1",
      dragState: null,
      outputVersion: saved.outputVersion || "V 2.0.4",
      variants:
        saved.variants ||
        [
          { version: "V 2.0.4", image: sampleOutputs[0], time: "14:12", selected: true },
          { version: "V 2.0.3", image: sampleOutputs[1], time: "13:46", selected: false },
        ],
      historyItems:
        saved.historyItems ||
        [
          { status: "项目打开", time: "14:12", detail: "节点编辑器已就绪。", highlight: true },
          { status: "节点连线", time: "13:55", detail: "Prompt、图片、视频节点已连接到生成节点。" },
          { status: "项目保存", time: "13:40", detail: "项目会自动保存到本地浏览器。" },
        ],
      generateTimer: null,
      toastTimer: null,
    };
  },
  computed: {
    shellStyle() {
      return { "--accent": this.accentColor };
    },
    canvasClasses() {
      return [
        "canvas",
        `canvas-${this.canvasBackground}`,
        `line-${this.lineStyle}`,
        { "grid-hidden": !this.showGrid },
      ];
    },
    activeColorName() {
      return this.colors.find((color) => color.value === this.accentColor)?.name || "自定义";
    },
    promptNode() {
      return this.nodes.find((node) => node.type === "prompt");
    },
    outputNode() {
      return this.nodes.find((node) => node.type === "output");
    },
    promptText() {
      return this.promptNode?.prompt || "";
    },
    promptProxy: {
      get() {
        return this.promptNode?.prompt || "";
      },
      set(value) {
        if (this.promptNode) this.promptNode.prompt = value;
      },
    },
    outputImage() {
      return this.outputNode?.image || sampleOutputs[0];
    },
    selectedNode() {
      return this.nodes.find((node) => node.id === this.selectedNodeId);
    },
    modelPickerTitle() {
      const names = { image: "图片生成模型", video: "视频生成模型", audio: "音频生成模型" };
      return names[this.modelPickerTool] || "生成模型";
    },
    actionPanelTitle() {
      const titles = {
        新建: "新建节点",
        工作流: "工作流操作",
        资产库: "资产库",
        插件: "插件中心",
        图片: "图片节点",
        指令: "指令面板",
        视图: "视图设置",
      };
      return titles[this.activeActionPanel] || "";
    },
    edgePaths() {
      return this.edges
        .map((edge) => {
          const from = this.nodes.find((node) => node.id === edge.from);
          const to = this.nodes.find((node) => node.id === edge.to);
          if (!from || !to) return null;

          const start = this.portPoint(from, "out");
          const end = this.portPoint(to, "in");
          const distance = Math.max(80, Math.abs(end.x - start.x) * 0.45);
          return {
            ...edge,
            path: `M ${start.x} ${start.y} C ${start.x + distance} ${start.y}, ${end.x - distance} ${end.y}, ${end.x} ${end.y}`,
          };
        })
        .filter(Boolean);
    },
    filteredHistory() {
      if (this.activeHistoryTab === "历史记录") return this.historyItems;
      if (this.activeHistoryTab === "队列任务") {
        return this.isGenerating
          ? [{ status: "队列任务", time: "现在", detail: `正在生成新版本，进度 ${this.progress}%`, highlight: true }]
          : [{ status: "队列空闲", time: "现在", detail: "当前没有等待处理的生成任务。" }];
      }
      if (this.activeHistoryTab === "素材库") {
        return [
          { status: "节点数量", time: String(this.nodes.length), detail: "项目内 Prompt、图片、视频、输出节点均可编辑。", highlight: true },
          { status: "连线数量", time: String(this.edges.length), detail: "节点之间的连接关系已保存。" },
        ];
      }
      return [{ status: "当前选中", time: "节点", detail: this.selectedNode?.title || "尚未选择节点。", highlight: true }];
    },
    boardCards() {
      return this.nodes.map((node) => ({
        title: node.title,
        meta: node.type,
        detail:
          node.type === "prompt"
            ? node.prompt
            : node.type === "process"
              ? this.statusText
              : node.type === "output"
                ? `${this.outputVersion} · ${this.variants.length} 个版本`
                : node.caption || node.note || "可在画布中编辑和连线",
      }));
    },
  },
  watch: {
    nodes: { handler: "autoSaveProject", deep: true },
    edges: { handler: "autoSaveProject", deep: true },
    selectedModels: { handler: "autoSaveProject", deep: true },
    variants: { handler: "autoSaveProject", deep: true },
    historyItems: { handler: "persist", deep: true },
    accentColor: "persist",
    canvasBackground: "persist",
    lineStyle: "persist",
    showGrid: "persist",
    snapGuide: "persist",
    activeView: "persist",
    activeTool: "persist",
    showCustomPanel: "persist",
    historyOpen: "persist",
    projectName: "persist",
    outputVersion: "persist",
  },
  methods: {
    loadSavedState() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      } catch {
        return {};
      }
    },
    persist() {
      const state = {
        activeNav: this.activeNav,
        activeTopTab: this.activeTopTab,
        activeView: this.activeView,
        activeTool: this.activeTool,
        selectedModels: this.selectedModels,
        accentColor: this.accentColor,
        canvasBackground: this.canvasBackground,
        lineStyle: this.lineStyle,
        showGrid: this.showGrid,
        snapGuide: this.snapGuide,
        showCustomPanel: this.showCustomPanel,
        historyOpen: this.historyOpen,
        projectName: this.projectName,
        savedAt: this.savedAt,
        nodes: this.nodes,
        edges: this.edges,
        selectedNodeId: this.selectedNodeId,
        progress: this.progress,
        statusText: this.statusText,
        outputVersion: this.outputVersion,
        variants: this.variants.slice(0, 8),
        historyItems: this.historyItems.slice(0, 12),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    autoSaveProject() {
      this.savedAt = nowLabel();
      this.persist();
    },
    saveProject() {
      this.savedAt = nowLabel();
      this.persist();
      this.addHistory("项目保存", `项目已保存到本地浏览器：${this.savedAt}`);
      this.flash("项目已保存");
    },
    exportProjectJson() {
      const blob = new Blob([JSON.stringify(this.loadSavedState(), null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tstage-project.json";
      link.click();
      URL.revokeObjectURL(url);
      this.addHistory("项目导出", "已导出项目 JSON 文件。");
    },
    flash(message) {
      this.toast = message;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast = "";
      }, 2200);
    },
    addHistory(status, detail) {
      this.historyItems.unshift({ status, time: nowLabel(), detail, highlight: true });
      this.historyItems = this.historyItems.map((item, index) => ({ ...item, highlight: index === 0 })).slice(0, 12);
    },
    selectNav(label) {
      this.activeNav = label;
      this.mobileMenuOpen = false;
      this.activeActionPanel = label;
      if (label === "图片") this.openModelPicker("image");
      if (label === "视图") this.showCustomPanel = true;
      this.addHistory("侧栏操作", `已打开“${label}”面板。`);
    },
    setView(view) {
      this.activeView = view;
      this.addHistory("视图切换", view === "canvas" ? "已切换到画布视图。" : "已切换到看板视图。");
    },
    chooseColor(color) {
      this.accentColor = color.value;
      this.addHistory("主题更新", `主色调已切换为${color.name}。`);
    },
    nodeSize(node) {
      const sizes = {
        prompt: { width: 384, height: 300 },
        process: { width: 384, height: 220 },
        image: { width: 590, height: 620 },
        video: { width: 610, height: 560 },
        output: { width: 512, height: 520 },
        note: { width: 288, height: 300 },
      };
      return sizes[node.type] || { width: 320, height: 260 };
    },
    portPoint(node, side) {
      const size = this.nodeSize(node);
      return {
        x: node.x + (side === "out" ? size.width : 0),
        y: node.y + size.height / 2,
      };
    },
    nodeStyle(node) {
      return {
        transform: `translate(${node.x}px, ${node.y}px)`,
        zIndex: this.dragState?.id === node.id ? 8 : 1,
      };
    },
    selectNode(node) {
      this.selectedNodeId = node.id;
    },
    startDrag(event, node) {
      if (event.target.closest("textarea, input, select, button, label, img, video")) return;
      this.selectNode(node);
      this.dragState = {
        id: node.id,
        startX: event.clientX,
        startY: event.clientY,
        originX: node.x,
        originY: node.y,
      };
      window.addEventListener("pointermove", this.onDrag);
      window.addEventListener("pointerup", this.endDrag, { once: true });
    },
    onDrag(event) {
      if (!this.dragState) return;
      const node = this.nodes.find((item) => item.id === this.dragState.id);
      if (!node) return;
      const snap = this.snapGuide ? 16 : 1;
      node.x = Math.max(0, Math.round((this.dragState.originX + event.clientX - this.dragState.startX) / snap) * snap);
      node.y = Math.max(0, Math.round((this.dragState.originY + event.clientY - this.dragState.startY) / snap) * snap);
    },
    endDrag() {
      if (this.dragState) this.addHistory("节点拖拽", "节点位置已更新。");
      this.dragState = null;
      window.removeEventListener("pointermove", this.onDrag);
    },
    beginConnection(node) {
      if (!this.pendingConnection) {
        this.pendingConnection = node.id;
        this.flash(`从“${node.title}”开始连线，再点击目标节点的连接按钮。`);
        return;
      }
      if (this.pendingConnection === node.id) {
        this.pendingConnection = "";
        return;
      }
      const edgeId = `edge-${Date.now()}`;
      const exists = this.edges.some((edge) => edge.from === this.pendingConnection && edge.to === node.id);
      if (!exists) {
        this.edges.push({ id: edgeId, from: this.pendingConnection, to: node.id });
        const fromNode = this.nodes.find((item) => item.id === this.pendingConnection);
        this.addHistory("节点连线", `已连接 ${fromNode?.title || "节点"} → ${node.title}。`);
      }
      this.pendingConnection = "";
    },
    removeEdge(edgeId) {
      this.edges = this.edges.filter((edge) => edge.id !== edgeId);
      this.addHistory("删除连线", "已移除一条节点连线。");
    },
    addNode(type) {
      const count = this.nodes.filter((node) => node.type === type).length + 1;
      const id = `${type}-${Date.now()}`;
      const base = {
        id,
        type,
        title:
          type === "prompt"
            ? `Prompt 节点 ${count}`
            : type === "image"
              ? `图片节点 ${count}`
              : type === "video"
                ? `视频节点 ${count}`
                : `节点 ${count}`,
        x: 120 + count * 42,
        y: 120 + count * 46,
      };

      if (type === "prompt") base.prompt = "Describe your idea here...";
      if (type === "image") {
        Object.assign(
          base,
          normalizeNode({
            type: "image",
            image: sampleOutputs[count % sampleOutputs.length],
            caption: "新图片节点",
          }),
        );
      }
      if (type === "video") {
        Object.assign(
          base,
          normalizeNode({
            type: "video",
            image: sampleOutputs[(count + 1) % sampleOutputs.length],
            caption: "新视频节点",
          }),
        );
      }

      this.nodes.push(base);
      this.selectedNodeId = id;
      this.activeActionPanel = "";
      this.addHistory("新增节点", `已创建${base.title}。`);
      this.flash(`${base.title} 已添加`);
    },
    deleteNode(node) {
      if (this.nodes.length <= 1) return;
      if (node.type === "prompt" && this.nodes.filter((item) => item.type === "prompt").length <= 1) {
        this.flash("至少保留一个 Prompt 节点。");
        return;
      }
      this.nodes = this.nodes.filter((item) => item.id !== node.id);
      this.edges = this.edges.filter((edge) => edge.from !== node.id && edge.to !== node.id);
      this.selectedNodeId = this.nodes[0]?.id || "";
      this.addHistory("删除节点", `已删除${node.title}。`);
    },
    modelChoicesFor(node) {
      return this.modelOptions[node.type === "video" ? "video" : "image"];
    },
    countOptionsFor(node) {
      return node.type === "video" ? [1, 2, 3] : [1, 2, 3, 4];
    },
    handleNodeReferenceUpload(event, node, slot = "reference") {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        node.refs ??= {};
        node.refs[slot] = {
          name: file.name,
          url: String(reader.result),
          type: file.type,
        };
        if (slot === "reference" && file.type.startsWith("image/")) {
          node.image = String(reader.result);
        }
        const label = slot === "firstFrame" ? "首帧" : slot === "lastFrame" ? "尾帧" : "参考图";
        this.addHistory("参考素材", `${node.title} 已添加${label}：${file.name}`);
        this.flash("参考素材已添加");
      };
      reader.readAsDataURL(file);
    },
    generateFromNode(node) {
      this.activeTool = node.type === "video" ? "video" : "image";
      if (node.model) this.selectedModels[this.activeTool] = node.model;
      const countLabel = node.type === "video" ? `${node.count || 1} 个视频` : `${node.count || 1} 张图片`;
      this.addHistory("节点生成", `${node.title} 使用 ${node.model} 生成 ${countLabel}。`);
      this.startGeneration();
    },
    openModelPicker(tool) {
      this.activeTool = tool;
      this.modelPickerTool = tool;
      this.modelPickerOpen = true;
      this.addHistory("模型选择", "已打开生成模型选项。");
    },
    selectModel(model) {
      this.selectedModels[this.modelPickerTool] = model.name;
      this.activeTool = this.modelPickerTool;
      this.modelPickerOpen = false;
      this.addHistory("模型切换", `${model.name} 已设为当前模型。`);
      this.flash(`已选择 ${model.name}`);
    },
    handleMediaUpload(event, node) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (file.type.startsWith("video/")) {
          node.video = String(reader.result);
          node.caption = file.name;
          node.type = "video";
        } else {
          node.image = String(reader.result);
          node.caption = file.name;
          if (node.type !== "output") node.type = "image";
        }
        this.addHistory("素材上传", `${node.title} 已载入文件：${file.name}`);
        this.flash("素材已上传");
      };
      reader.readAsDataURL(file);
    },
    handlePromptUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result).trim();
        const node = this.promptNode || this.nodes.find((item) => item.type === "prompt");
        if (node && text) node.prompt = text;
        this.activeActionPanel = "";
        this.addHistory("提示词导入", `已导入提示词文件：${file.name}`);
        this.flash("提示词已导入");
      };
      reader.readAsText(file, "utf-8");
    },
    startGeneration() {
      if (this.isGenerating) return;
      if (!this.promptText.trim()) {
        this.flash("先写一点 Prompt，再开始生成。");
        return;
      }

      this.isGenerating = true;
      this.progress = 6;
      this.statusText = `正在使用 ${this.selectedModels[this.activeTool]} 分析节点`;
      this.addHistory("开始生成", `已创建 ${this.selectedModels[this.activeTool]} 生成任务。`);

      const steps = [
        [20, "正在读取 Prompt 节点"],
        [42, "正在分析图片 / 视频节点"],
        [63, "正在合成节点上下文"],
        [84, "正在渲染高清输出"],
        [100, "生成完成"],
      ];
      let index = 0;

      clearInterval(this.generateTimer);
      this.generateTimer = setInterval(() => {
        const [nextProgress, nextStatus] = steps[index];
        this.progress = nextProgress;
        this.statusText = nextStatus;
        index += 1;

        if (this.progress >= 100) {
          clearInterval(this.generateTimer);
          this.isGenerating = false;
          const nextPatch = Number(this.outputVersion.split(".").at(-1) || 4) + 1;
          const nextImage = sampleOutputs[(this.variants.length + 1) % sampleOutputs.length];
          this.outputVersion = `V 2.0.${nextPatch}`;
          const output = this.outputNode;
          if (output) output.image = nextImage;
          this.variants = this.variants.map((item) => ({ ...item, selected: false }));
          this.variants.unshift({ version: this.outputVersion, image: nextImage, time: nowLabel(), selected: true });
          this.variants = this.variants.slice(0, 8);
          this.addHistory("成功生成", `已完成“输出结果 ${this.outputVersion}”。`);
          this.flash("新版本已生成");
        }
      }, 620);
    },
    selectVariant(variant) {
      this.variants = this.variants.map((item) => ({ ...item, selected: item.version === variant.version }));
      this.outputVersion = variant.version;
      const output = this.outputNode;
      if (output) output.image = variant.image;
      this.addHistory("版本切换", `已切换到 ${variant.version}。`);
    },
    resetWorkflow() {
      clearInterval(this.generateTimer);
      localStorage.removeItem(STORAGE_KEY);
      this.nodes = clone(defaultNodes);
      this.edges = clone(defaultEdges);
      this.selectedNodeId = "prompt-1";
      this.progress = 65;
      this.statusText = "等待下一次生成";
      this.outputVersion = "V 2.0.4";
      this.variants = [
        { version: "V 2.0.4", image: sampleOutputs[0], time: "14:12", selected: true },
        { version: "V 2.0.3", image: sampleOutputs[1], time: "13:46", selected: false },
      ];
      this.historyItems = [{ status: "项目重置", time: nowLabel(), detail: "已恢复到默认节点项目。", highlight: true }];
      this.flash("已重置");
    },
    resetNodePositions() {
      const positions = Object.fromEntries(defaultNodes.map((node) => [node.id, { x: node.x, y: node.y }]));
      this.nodes.forEach((node, index) => {
        const next = positions[node.id] || { x: 120 + index * 48, y: 120 + index * 40 };
        node.x = next.x;
        node.y = next.y;
      });
      this.addHistory("画布整理", "节点位置已恢复默认布局。");
      this.flash("画布已整理");
    },
    exportWorkflow() {
      const markdown = [
        "# T-Stage 工作流导出",
        "",
        `- 项目：${this.projectName}`,
        `- 当前版本：${this.outputVersion}`,
        `- 当前模型：${this.selectedModels[this.activeTool]}`,
        `- 节点数量：${this.nodes.length}`,
        `- 连线数量：${this.edges.length}`,
        "",
        "## Prompt",
        this.promptText,
        "",
        "## 节点",
        ...this.nodes.map((node) => `- ${node.title} (${node.type}) @ ${node.x}, ${node.y}`),
        "",
        "## 连线",
        ...this.edges.map((edge) => `- ${edge.from} -> ${edge.to}`),
      ].join("\n");

      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tstage-workflow.md";
      link.click();
      URL.revokeObjectURL(url);
      this.addHistory("导出文档", "已导出工作流 Markdown 文档。");
      this.flash("文档已导出");
    },
    publishWorkflow() {
      this.addHistory("发布检查", "发布前检查已完成，当前项目可用于演示。");
      this.flash("项目已准备好");
    },
  },
  beforeUnmount() {
    clearInterval(this.generateTimer);
    clearTimeout(this.toastTimer);
    window.removeEventListener("pointermove", this.onDrag);
  },
  template: `
    <div class="app-shell" :style="shellStyle" :class="{ 'history-collapsed': !historyOpen, 'is-dragging': dragState }">
      <aside class="rail" :class="{ open: mobileMenuOpen }" aria-label="主导航">
        <div class="brand">T-Stage</div>
        <button
          v-for="item in navItems"
          :key="item.label"
          :class="['rail-button', { active: activeNav === item.label }]"
          :aria-label="item.label"
          :title="item.label"
          @click="selectNav(item.label)"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
        </button>
        <div class="rail-spacer"></div>
        <button class="rail-button" aria-label="设置" title="设置" @click="showCustomPanel = true">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <button class="mobile-menu-button" type="button" aria-label="打开导航" @click="mobileMenuOpen = !mobileMenuOpen">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <nav class="tabs" aria-label="工作区">
            <button
              v-for="tab in topTabs"
              :key="tab"
              :class="{ active: activeTopTab === tab }"
              @click="activeTopTab = tab"
            >{{ tab }}</button>
          </nav>
          <div class="topbar-actions">
            <div class="view-toggle" aria-label="视图切换">
              <button :class="{ active: activeView === 'canvas' }" @click="setView('canvas')">画布</button>
              <button :class="{ active: activeView === 'board' }" @click="setView('board')">看板</button>
            </div>
            <button class="ghost-button" @click="saveProject">保存</button>
            <button class="ghost-button" @click="resetWorkflow">重置</button>
            <button class="ghost-button" @click="exportWorkflow">导出</button>
            <button class="primary-button" @click="publishWorkflow">发布</button>
          </div>
        </header>

        <div class="work-area">
          <main :class="canvasClasses" aria-label="工作流画布">
            <template v-if="activeView === 'canvas'">
              <div v-if="showTopProgress" class="top-progress-strip">
                <span>{{ isGenerating ? statusText : '生成进度' }}</span>
                <div class="top-progress-track">
                  <i :style="{ width: progress + '%' }"></i>
                </div>
                <b>{{ progress }}%</b>
                <button aria-label="关闭进度条" @click="showTopProgress = false">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
              <svg class="connection-layer" width="1700" height="1000" aria-label="节点连线">
                <path
                  v-for="edge in edgePaths"
                  :key="edge.id"
                  :d="edge.path"
                  @click="removeEdge(edge.id)"
                />
              </svg>

              <section class="node-stage">
                <article
                  v-for="node in nodes"
                  :key="node.id"
                  :class="['draggable-node', 'node-card', node.type + '-node', { selected: selectedNodeId === node.id, pending: pendingConnection === node.id }]"
                  :style="nodeStyle(node)"
                  @pointerdown="startDrag($event, node)"
                  @click="selectNode(node)"
                >
                  <div class="node-meta">
                    <span>{{ node.type.toUpperCase() }}</span>
                    <div class="node-actions">
                      <button class="node-port" title="连接节点" @click.stop="beginConnection(node)">
                        <span class="material-symbols-outlined">device_hub</span>
                      </button>
                      <button class="node-delete" title="删除节点" @click.stop="deleteNode(node)">
                        <span class="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>

                  <input v-model="node.title" class="node-title-input" aria-label="节点名称" />

                  <template v-if="node.type === 'prompt'">
                    <textarea v-model="node.prompt" class="prompt-input" rows="6" placeholder="输入 Prompt"></textarea>
                    <footer>Prompt 节点 · 自动保存</footer>
                  </template>

                  <template v-else-if="node.type === 'image'">
                    <div class="media-node-label">
                      <span class="material-symbols-outlined">image</span>
                      <strong>图片节点</strong>
                    </div>
                    <div class="media-preview">
                      <img :src="node.image" alt="图片节点预览" />
                      <label class="media-add-button" title="添加参考图">
                        <span class="material-symbols-outlined">add</span>
                        <input type="file" accept="image/*" @change="handleNodeReferenceUpload($event, node, 'reference')" />
                      </label>
                      <button class="composer-toggle" @click.stop="node.composerOpen = !node.composerOpen">
                        <span class="material-symbols-outlined">{{ node.composerOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</span>
                        {{ node.composerOpen ? '隐藏生成设置' : '打开生成设置' }}
                      </button>
                    </div>
                    <section v-if="node.composerOpen" class="generation-composer">
                      <div class="composer-toolbar">
                        <label class="composer-icon-button" title="添加参考图">
                          <span class="material-symbols-outlined">add_photo_alternate</span>
                          <b>添加参考图</b>
                          <input type="file" accept="image/*" @change="handleNodeReferenceUpload($event, node, 'reference')" />
                        </label>
                        <div v-if="node.refs?.reference" class="ref-chip">
                          <img :src="node.refs.reference.url" alt="" />
                          <span>{{ node.refs.reference.name }}</span>
                        </div>
                      </div>
                      <textarea v-model="node.prompt" rows="3" placeholder="描述你想生成的内容，按 @ 引用素材"></textarea>
                      <div class="composer-controls">
                        <select v-model="node.model">
                          <option v-for="model in modelChoicesFor(node)" :key="model.name" :value="model.name">{{ model.name }}</option>
                        </select>
                        <select v-model="node.ratio">
                          <option v-for="ratio in aspectRatios" :key="ratio">{{ ratio }}</option>
                        </select>
                        <select v-model="node.size">
                          <option v-for="size in imageSizes" :key="size">{{ size }}</option>
                        </select>
                        <select v-model.number="node.count">
                          <option v-for="count in countOptionsFor(node)" :key="count" :value="count">{{ count }} 张</option>
                        </select>
                      </div>
                      <div class="composer-footer">
                        <span>{{ node.model }} · {{ node.ratio }} · {{ node.size }}</span>
                        <button class="node-generate-button" @click="generateFromNode(node)" :disabled="isGenerating">
                          <span class="material-symbols-outlined">auto_awesome</span>
                        </button>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="node.type === 'video'">
                    <div class="media-node-label">
                      <span class="material-symbols-outlined">smart_display</span>
                      <strong>视频节点</strong>
                    </div>
                    <div class="media-preview video-preview">
                      <video v-if="node.video" :src="node.video" controls></video>
                      <img v-else :src="node.image" alt="视频节点封面" />
                      <span v-if="!node.video" class="play-placeholder material-symbols-outlined">play_arrow</span>
                      <label class="media-add-button" title="上传视频或封面">
                        <span class="material-symbols-outlined">add</span>
                        <input type="file" accept="video/*,image/*" @change="handleMediaUpload($event, node)" />
                      </label>
                      <button class="composer-toggle" @click.stop="node.composerOpen = !node.composerOpen">
                        <span class="material-symbols-outlined">{{ node.composerOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</span>
                        {{ node.composerOpen ? '隐藏生成设置' : '打开生成设置' }}
                      </button>
                    </div>
                    <section v-if="node.composerOpen" class="generation-composer video-composer">
                      <div class="composer-toolbar">
                        <label class="composer-icon-button" title="添加首帧">
                          <span class="material-symbols-outlined">first_page</span>
                          <b>首帧</b>
                          <input type="file" accept="image/*" @change="handleNodeReferenceUpload($event, node, 'firstFrame')" />
                        </label>
                        <label class="composer-icon-button" title="添加尾帧">
                          <span class="material-symbols-outlined">last_page</span>
                          <b>尾帧</b>
                          <input type="file" accept="image/*" @change="handleNodeReferenceUpload($event, node, 'lastFrame')" />
                        </label>
                        <label class="composer-icon-button" title="添加参考图">
                          <span class="material-symbols-outlined">add_photo_alternate</span>
                          <b>参考图</b>
                          <input type="file" accept="image/*" @change="handleNodeReferenceUpload($event, node, 'reference')" />
                        </label>
                        <div v-if="node.refs?.firstFrame" class="ref-chip">
                          <img :src="node.refs.firstFrame.url" alt="" />
                          <span>首帧</span>
                        </div>
                        <div v-if="node.refs?.lastFrame" class="ref-chip">
                          <img :src="node.refs.lastFrame.url" alt="" />
                          <span>尾帧</span>
                        </div>
                        <div v-if="node.refs?.reference" class="ref-chip">
                          <img :src="node.refs.reference.url" alt="" />
                          <span>参考</span>
                        </div>
                      </div>
                      <textarea v-model="node.prompt" rows="3" placeholder="描述你想生成的视频内容，按 @ 引用素材"></textarea>
                      <div class="composer-controls">
                        <select v-model="node.model">
                          <option v-for="model in modelChoicesFor(node)" :key="model.name" :value="model.name">{{ model.name }}</option>
                        </select>
                        <select v-model="node.ratio">
                          <option v-for="ratio in aspectRatios" :key="ratio">{{ ratio }}</option>
                        </select>
                        <select v-model="node.resolution">
                          <option v-for="resolution in videoResolutions" :key="resolution">{{ resolution }}</option>
                        </select>
                        <select v-model="node.duration">
                          <option v-for="duration in videoDurations" :key="duration">{{ duration }}</option>
                        </select>
                        <select v-model.number="node.count">
                          <option v-for="count in countOptionsFor(node)" :key="count" :value="count">{{ count }} 个</option>
                        </select>
                      </div>
                      <div class="composer-footer">
                        <span>{{ node.model }} · {{ node.ratio }} · {{ node.resolution }} · {{ node.duration }}</span>
                        <button class="node-generate-button" @click="generateFromNode(node)" :disabled="isGenerating">
                          <span class="material-symbols-outlined">auto_awesome</span>
                        </button>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="node.type === 'process'">
                    <h2>生成进度</h2>
                    <div class="progress-track">
                      <span :style="{ width: progress + '%' }"></span>
                    </div>
                    <p class="process-copy">{{ progress }}%</p>
                    <button class="inline-action" @click="showTopProgress = true">显示顶部进度</button>
                  </template>

                  <template v-else-if="node.type === 'output'">
                    <figure>
                      <img :src="node.image" alt="输出结果" />
                      <figcaption><button @click="previewOpen = true">查看高清原图</button></figcaption>
                    </figure>
                    <div class="output-footer">
                      <h2>输出结果</h2>
                      <span>{{ outputVersion }} · STABLE</span>
                    </div>
                    <div class="variant-strip" aria-label="输出版本">
                      <button
                        v-for="variant in variants"
                        :key="variant.version"
                        :class="{ active: variant.selected }"
                        @click="selectVariant(variant)"
                      >
                        <img :src="variant.image" alt="" />
                        <span>{{ variant.version }}</span>
                      </button>
                    </div>
                  </template>

                  <template v-else-if="node.type === 'note'">
                    <textarea v-model="node.note" class="note-input" rows="6"></textarea>
                    <footer>批注节点 · 自动保存</footer>
                  </template>
                </article>
              </section>
            </template>

            <section v-else class="board-view" aria-label="工作流看板">
              <article v-for="card in boardCards" :key="card.title" class="board-card">
                <span>{{ card.meta }}</span>
                <h2>{{ card.title }}</h2>
                <p>{{ card.detail }}</p>
              </article>
            </section>

            <aside class="minimap" aria-label="画布全景图">
              <header>
                <span>画布全景图</span>
                <button class="mini-icon" @click="resetNodePositions" aria-label="整理画布">
                  <span class="material-symbols-outlined">open_in_full</span>
                </button>
              </header>
              <div class="minimap-body">
                <i class="map-node a"></i>
                <i class="map-node b"></i>
                <i class="map-node c"></i>
                <i class="viewport"></i>
              </div>
            </aside>

            <aside v-if="showCustomPanel" class="custom-panel" aria-label="界面设置">
              <header>
                <h2>自定义工作界面</h2>
                <button aria-label="关闭" @click="showCustomPanel = false"><span class="material-symbols-outlined">close</span></button>
              </header>
              <nav>
                <button
                  v-for="tab in panelTabs"
                  :key="tab"
                  :class="{ active: activePanelTab === tab }"
                  @click="activePanelTab = tab"
                >{{ tab }}</button>
              </nav>
              <section v-if="activePanelTab === '外观主题'">
                <span class="section-label">主色调 · {{ activeColorName }}</span>
                <div class="swatches">
                  <button
                    v-for="color in colors"
                    :key="color.value"
                    :style="{ backgroundColor: color.value }"
                    :class="{ selected: color.value === accentColor }"
                    :aria-label="'选择' + color.name"
                    @click="chooseColor(color)"
                  ></button>
                </div>
              </section>
              <section v-if="activePanelTab === '画布背景'">
                <span class="section-label">背景样式</span>
                <div class="option-list">
                  <button
                    v-for="option in canvasBackgrounds"
                    :key="option.id"
                    :class="{ active: canvasBackground === option.id }"
                    @click="canvasBackground = option.id"
                  >{{ option.label }}</button>
                </div>
              </section>
              <section v-if="activePanelTab === '连接样式'">
                <span class="section-label">连线样式</span>
                <div class="option-list">
                  <button
                    v-for="option in lineStyles"
                    :key="option.id"
                    :class="{ active: lineStyle === option.id }"
                    @click="lineStyle = option.id"
                  >{{ option.label }}</button>
                </div>
              </section>
              <section>
                <span class="section-label">视图辅助</span>
                <label class="switch-row">
                  <span>显示动态网格</span>
                  <input type="checkbox" v-model="showGrid" />
                  <i></i>
                </label>
                <label class="switch-row">
                  <span>吸附参考线</span>
                  <input type="checkbox" v-model="snapGuide" />
                  <i></i>
                </label>
              </section>
            </aside>

            <aside v-if="activeActionPanel" class="app-action-panel" aria-label="侧边栏操作面板">
              <header>
                <h2>{{ actionPanelTitle }}</h2>
                <button aria-label="关闭" @click="activeActionPanel = ''">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </header>

              <template v-if="activeActionPanel === '新建'">
                <button class="action-card" @click="addNode('prompt')">
                  <span class="material-symbols-outlined">edit_note</span>
                  <strong>新增 Prompt 节点</strong>
                  <small>用于输入生成提示词</small>
                </button>
                <button class="action-card" @click="addNode('image')">
                  <span class="material-symbols-outlined">image</span>
                  <strong>新增图片节点</strong>
                  <small>支持上传图片素材</small>
                </button>
                <button class="action-card" @click="addNode('video')">
                  <span class="material-symbols-outlined">videocam</span>
                  <strong>新增视频节点</strong>
                  <small>支持上传视频或封面</small>
                </button>
                <label class="action-upload">
                  <span class="material-symbols-outlined">description</span>
                  <strong>上传提示词</strong>
                  <small>支持 .txt 文本</small>
                  <input type="file" accept=".txt,text/plain" @change="handlePromptUpload" />
                </label>
              </template>

              <template v-else-if="activeActionPanel === '图片'">
                <button class="action-card" @click="openModelPicker('image')">
                  <span class="material-symbols-outlined">auto_awesome</span>
                  <strong>选择图片生成模型</strong>
                  <small>当前：{{ selectedModels.image }}</small>
                </button>
                <button class="action-card" @click="addNode('image')">
                  <span class="material-symbols-outlined">add_photo_alternate</span>
                  <strong>新增图片节点</strong>
                  <small>添加到当前画布</small>
                </button>
              </template>

              <template v-else-if="activeActionPanel === '视图'">
                <button class="action-card" @click="resetNodePositions">
                  <span class="material-symbols-outlined">dashboard_customize</span>
                  <strong>整理画布节点</strong>
                  <small>恢复默认位置</small>
                </button>
                <button class="action-card" @click="showCustomPanel = true">
                  <span class="material-symbols-outlined">palette</span>
                  <strong>打开界面设置</strong>
                  <small>主题、背景、连接线</small>
                </button>
              </template>

              <template v-else>
                <button class="action-card" @click="saveProject">
                  <span class="material-symbols-outlined">save</span>
                  <strong>保存项目</strong>
                  <small>保存到本地浏览器</small>
                </button>
                <button class="action-card" @click="exportProjectJson">
                  <span class="material-symbols-outlined">data_object</span>
                  <strong>导出项目 JSON</strong>
                  <small>包含节点与连线数据</small>
                </button>
              </template>
            </aside>

            <form class="command-bar" @submit.prevent="startGeneration">
              <input v-model="promptProxy" aria-label="快速 Prompt" placeholder="输入 Prompt 后生成" />
              <div class="quick-tools">
                <button type="button" :class="{ active: activeTool === 'image' }" aria-label="图片" @click="openModelPicker('image')">
                  <span class="material-symbols-outlined">image</span>
                </button>
                <button type="button" :class="{ active: activeTool === 'video' }" aria-label="视频" @click="openModelPicker('video')">
                  <span class="material-symbols-outlined">videocam</span>
                </button>
                <button type="button" :class="{ active: activeTool === 'audio' }" aria-label="音频" @click="openModelPicker('audio')">
                  <span class="material-symbols-outlined">audio_file</span>
                </button>
              </div>
              <button class="generate-button" type="submit" :disabled="isGenerating">
                <span class="material-symbols-outlined">auto_awesome</span>
                <strong>{{ isGenerating ? '生成中' : '生成' }}</strong>
              </button>
            </form>
          </main>

          <aside class="history-panel" aria-label="操作历史">
            <button class="collapse-handle" aria-label="收起侧栏" @click="historyOpen = !historyOpen">
              <span class="material-symbols-outlined">{{ historyOpen ? 'chevron_right' : 'chevron_left' }}</span>
            </button>
            <div class="history-content">
              <header class="history-title">
                <h1>历史记录</h1>
                <p>节点、连线、上传、保存都会记录</p>
              </header>
              <nav class="history-tabs">
                <button
                  v-for="tab in historyTabs"
                  :key="tab"
                  :class="{ active: activeHistoryTab === tab }"
                  @click="activeHistoryTab = tab"
                >{{ tab }}</button>
              </nav>
              <div class="history-list">
                <article v-for="item in filteredHistory" :key="item.time + item.status + item.detail" class="history-item">
                  <header>
                    <strong :class="{ highlight: item.highlight }">{{ item.status }}</strong>
                    <time>{{ item.time }}</time>
                  </header>
                  <p>{{ item.detail }}</p>
                </article>
              </div>
              <footer class="history-links">
                <button @click="saveProject"><span class="material-symbols-outlined">save</span>保存项目</button>
                <button @click="exportProjectJson"><span class="material-symbols-outlined">data_object</span>导出项目 JSON</button>
                <button @click="exportWorkflow"><span class="material-symbols-outlined">description</span>导出工作流文档</button>
              </footer>
            </div>
          </aside>
        </div>
      </section>

      <div v-if="mobileMenuOpen" class="mobile-scrim" @click="mobileMenuOpen = false"></div>

      <div v-if="modelPickerOpen" class="modal-scrim" @click.self="modelPickerOpen = false">
        <section class="model-picker" aria-label="模型选择">
          <header>
            <h2>{{ modelPickerTitle }}</h2>
            <button aria-label="关闭" @click="modelPickerOpen = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>
          <button
            v-for="model in modelOptions[modelPickerTool]"
            :key="model.name"
            :class="['model-option', { active: selectedModels[modelPickerTool] === model.name }]"
            @click="selectModel(model)"
          >
            <span class="material-symbols-outlined">auto_awesome</span>
            <strong>{{ model.name }}</strong>
            <small>{{ model.detail }}</small>
          </button>
        </section>
      </div>

      <dialog class="preview-dialog" :open="previewOpen" @click.self="previewOpen = false">
        <button class="dialog-close" aria-label="关闭预览" @click="previewOpen = false">
          <span class="material-symbols-outlined">close</span>
        </button>
        <img :src="outputImage" alt="高清输出预览" />
        <footer>
          <strong>{{ outputVersion }} 高清预览</strong>
          <span>主题色：{{ activeColorName }} · {{ statusText }}</span>
        </footer>
      </dialog>

      <div v-if="toast" class="toast">{{ toast }}</div>
    </div>
  `,
};

createApp(App).mount("#app");
