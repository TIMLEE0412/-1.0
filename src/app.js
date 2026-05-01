import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";

const STORAGE_KEY = "tstage-node-editor";

const navItems = [
  { icon: "add", label: "新建" },
  { icon: "edit_note", label: "工作流" },
  { icon: "inventory_2", label: "资产库" },
  { icon: "extension", label: "插件" },
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
const generatedTypes = ["image", "video", "audio"];

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
    progress: 0,
    statusText: "等待生成",
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
    progress: 0,
    statusText: "等待生成",
  },
  { id: "output-1", type: "output", title: "输出结果", x: 1420, y: 40, image: sampleOutputs[0] },
  { id: "note-1", type: "note", title: "创作笔记", x: 1600, y: 620, note: "下一轮降低高光强度，保留织物纹理和暗部层次。" },
];

const defaultEdges = [
  { id: "edge-1", from: "image-1", to: "video-1" },
  { id: "edge-2", from: "video-1", to: "output-1" },
  { id: "edge-3", from: "output-1", to: "note-1" },
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
    next.progress ??= 0;
    next.statusText ??= "等待生成";
    next.isGenerating ??= false;
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
    next.progress ??= 0;
    next.statusText ??= "等待生成";
    next.isGenerating ??= false;
  }
  if (next.type === "audio") {
    next.prompt ??= "描述你想生成的音乐或音频内容";
    next.model ??= "Eleven Voice";
    next.count ??= 1;
    next.refs ??= {};
    next.composerOpen ??= true;
    next.progress ??= 0;
    next.statusText ??= "等待生成";
    next.isGenerating ??= false;
  }
  return next;
}

function isCanvasNodeAllowed(node) {
  return !["prompt", "process"].includes(node.type);
}

function mediaNodesFrom(nodes) {
  return nodes.filter((node) => generatedTypes.includes(node.type));
}

function cleanNodes(nodes) {
  return nodes.filter(isCanvasNodeAllowed).map(normalizeNode);
}

function cleanEdges(edges, nodes) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  return edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
}

const App = {
  data() {
    const saved = this.loadSavedState();
    const loadedNodes = cleanNodes(saved.nodes || clone(defaultNodes));
    let loadedEdges = cleanEdges(saved.edges || clone(defaultEdges), loadedNodes);
    if (!loadedEdges.length) loadedEdges = cleanEdges(clone(defaultEdges), loadedNodes);
    const firstMediaNode = mediaNodesFrom(loadedNodes)[0] || loadedNodes[0];
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
      saveTargetPath: saved.saveTargetPath || "本地浏览器",
      commandPrompt: saved.commandPrompt || "",
      commandRefs: saved.commandRefs || {},
      canvasZoom: saved.canvasZoom || 1,
      minimapCollapsed: saved.minimapCollapsed ?? false,
      minimapZoom: saved.minimapZoom || 1,
      lastGeneratedNodeId: saved.lastGeneratedNodeId || "",
      saveDirectoryHandle: null,
      nodeCreateMenu: { open: false, x: 0, y: 0, sourceNodeId: "", title: "添加节点" },
      referencePicker: { open: false, x: 0, y: 0, targetNodeId: "", slot: "reference", mode: "node" },
      canvasScrollLeft: 0,
      canvasScrollTop: 0,
      selectedNodeIds: saved.selectedNodeIds || [],
      selectionBox: null,
      selectionStart: null,
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
      progress: saved.progress || firstMediaNode?.progress || 0,
      statusText: saved.statusText || firstMediaNode?.statusText || "等待生成",
      toast: "",
      projectName: saved.projectName || "T-Stage 试用项目",
      savedAt: saved.savedAt || "",
      nodes: loadedNodes,
      edges: loadedEdges,
      pendingConnection: "",
      selectedNodeId: loadedNodes.some((node) => node.id === saved.selectedNodeId)
        ? saved.selectedNodeId
        : firstMediaNode?.id || "",
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
    canvasWorldStyle() {
      return {
        width: `${2100 * this.canvasZoom}px`,
        height: `${1000 * this.canvasZoom}px`,
      };
    },
    canvasContentStyle() {
      return {
        transform: `scale(${this.canvasZoom})`,
      };
    },
    selectionBoxStyle() {
      if (!this.selectionBox) return {};
      const { x, y, width, height } = this.selectionBox;
      return {
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
      };
    },
    minimapPanelStyle() {
      return {
        transform: `scale(${this.minimapZoom})`,
      };
    },
    minimapViewportStyle() {
      const scale = 0.105;
      const canvas = this.$el?.querySelector?.(".canvas");
      const width = ((canvas?.clientWidth || 1000) / this.canvasZoom) * scale;
      const height = ((canvas?.clientHeight || 700) / this.canvasZoom) * scale;
      return {
        transform: `translate(${this.canvasScrollLeft / this.canvasZoom * scale}px, ${this.canvasScrollTop / this.canvasZoom * scale}px)`,
        width: `${Math.max(24, Math.min(210, width))}px`,
        height: `${Math.max(18, Math.min(100, height))}px`,
      };
    },
    selectedNodes() {
      return this.nodes.filter((node) => this.selectedNodeIds.includes(node.id));
    },
    canvasReferenceNodes() {
      return this.nodes.filter((node) => generatedTypes.includes(node.type) && (node.image || node.video || node.prompt));
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
    outputNode() {
      return this.nodes.find((node) => node.type === "output");
    },
    activeMediaNode() {
      if (generatedTypes.includes(this.selectedNode?.type)) return this.selectedNode;
      return mediaNodesFrom(this.nodes)[0];
    },
    promptText() {
      return this.commandPrompt || this.activeMediaNode?.prompt || "";
    },
    promptProxy: {
      get() {
        return this.commandPrompt;
      },
      set(value) {
        this.commandPrompt = value;
      },
    },
    displayProgress() {
      return this.activeMediaNode?.progress ?? this.progress;
    },
    displayProgressText() {
      return this.activeMediaNode?.statusText || "生成进度";
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
    saveTargetPath: "persist",
    commandPrompt: "persist",
    commandRefs: { handler: "persist", deep: true },
    canvasZoom: "persist",
    minimapCollapsed: "persist",
    minimapZoom: "persist",
    lastGeneratedNodeId: "persist",
    selectedNodeIds: "persist",
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
        saveTargetPath: this.saveTargetPath,
        commandPrompt: this.commandPrompt,
        commandRefs: this.commandRefs,
        canvasZoom: this.canvasZoom,
        minimapCollapsed: this.minimapCollapsed,
        minimapZoom: this.minimapZoom,
        lastGeneratedNodeId: this.lastGeneratedNodeId,
        selectedNodeIds: this.selectedNodeIds,
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
      this.addHistory("项目保存", `项目已保存到：${this.saveTargetPath}`);
      this.flash("项目已保存");
    },
    async chooseSaveFolder() {
      if (window.showDirectoryPicker) {
        try {
          const directory = await window.showDirectoryPicker();
          this.saveDirectoryHandle = directory;
          this.saveTargetPath = directory.name || "本地文件夹";
          this.addHistory("保存位置", `已选择保存到：${this.saveTargetPath}`);
          await this.writeProjectJsonToFolder();
          this.flash("已保存到本地");
          return;
        } catch {
          return;
        }
      }
      this.saveTargetPath = "本地浏览器";
      this.flash("当前浏览器使用本地保存");
    },
    projectJsonBlob() {
      this.savedAt = nowLabel();
      this.persist();
      return new Blob([JSON.stringify(this.loadSavedState(), null, 2)], {
        type: "application/json;charset=utf-8",
      });
    },
    async writeProjectJsonToFolder() {
      if (!this.saveDirectoryHandle) return false;
      const file = await this.saveDirectoryHandle.getFileHandle("tstage-project.json", { create: true });
      const writable = await file.createWritable();
      await writable.write(this.projectJsonBlob());
      await writable.close();
      this.addHistory("项目保存", `项目 JSON 已保存到：${this.saveTargetPath}`);
      return true;
    },
    async exportProjectJson() {
      if (this.saveDirectoryHandle && (await this.writeProjectJsonToFolder())) {
        this.flash("项目 JSON 已保存到本地文件夹");
        return;
      }
      const blob = this.projectJsonBlob();
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
      this.addHistory("侧栏操作", `已打开“${label}”面板。`);
    },
    setView(view) {
      this.activeView = view;
      this.addHistory("视图切换", view === "canvas" ? "已切换到画布视图。" : "已切换到看板视图。");
    },
    handleCanvasWheel(event) {
      if (!event.ctrlKey || this.activeView !== "canvas") return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.08 : 0.08;
      this.canvasZoom = Math.max(0.35, Math.min(1.8, Number((this.canvasZoom + delta).toFixed(2))));
    },
    syncCanvasScroll(event) {
      this.canvasScrollLeft = event.currentTarget.scrollLeft;
      this.canvasScrollTop = event.currentTarget.scrollTop;
    },
    canvasPoint(event) {
      const canvas = this.$el.querySelector(".canvas");
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left + canvas.scrollLeft) / this.canvasZoom,
        y: (event.clientY - rect.top + canvas.scrollTop) / this.canvasZoom,
      };
    },
    startCanvasSelection(event) {
      if (event.button !== 0 || this.activeView !== "canvas") return;
      if (event.target.closest(".draggable-node, .top-progress-strip, .minimap, .custom-panel, .app-action-panel, .command-bar, button, input, select, textarea, label")) return;
      if (this.pendingConnection) {
        this.openNodeCreateMenu(event, this.pendingConnection, "引用该节点生成");
        return;
      }
      this.closeFloatingMenus();
      const point = this.canvasPoint(event);
      this.selectionStart = point;
      this.selectionBox = { x: point.x, y: point.y, width: 0, height: 0 };
      this.selectedNodeIds = [];
      window.addEventListener("pointermove", this.onSelectMove);
      window.addEventListener("pointerup", this.endCanvasSelection, { once: true });
    },
    handleCanvasClick(event) {
      if (!this.pendingConnection) return;
      if (event.target.closest(".draggable-node, .top-progress-strip, .minimap, .custom-panel, .app-action-panel, .command-bar, button, input, select, textarea, label")) return;
      this.openNodeCreateMenu(event, this.pendingConnection, "引用该节点生成");
    },
    onSelectMove(event) {
      if (!this.selectionStart) return;
      const point = this.canvasPoint(event);
      const x = Math.min(this.selectionStart.x, point.x);
      const y = Math.min(this.selectionStart.y, point.y);
      const width = Math.abs(point.x - this.selectionStart.x);
      const height = Math.abs(point.y - this.selectionStart.y);
      this.selectionBox = { x, y, width, height };
    },
    endCanvasSelection() {
      if (this.selectionBox && (this.selectionBox.width > 6 || this.selectionBox.height > 6)) {
        const box = this.selectionBox;
        this.selectedNodeIds = this.nodes
          .filter((node) => {
            const size = this.nodeSize(node);
            return node.x < box.x + box.width && node.x + size.width > box.x && node.y < box.y + box.height && node.y + size.height > box.y;
          })
          .map((node) => node.id);
        this.selectedNodeId = this.selectedNodeIds[0] || "";
      }
      this.selectionBox = null;
      this.selectionStart = null;
      window.removeEventListener("pointermove", this.onSelectMove);
    },
    onKeyDown(event) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (event.target.closest?.("input, textarea, select")) return;
      this.deleteSelectedNodes();
    },
    minimapNodeStyle(node) {
      const scale = 0.105;
      const size = this.nodeSize(node);
      return {
        transform: `translate(${node.x * scale}px, ${node.y * scale}px)`,
        width: `${Math.max(10, size.width * scale)}px`,
        height: `${Math.max(8, size.height * scale)}px`,
      };
    },
    jumpMinimap(event) {
      if (this.minimapCollapsed) return;
      const body = event.currentTarget;
      const rect = body.getBoundingClientRect();
      const scale = 0.105 * this.minimapZoom;
      const canvas = this.$el.querySelector(".canvas");
      const x = (event.clientX - rect.left) / scale;
      const y = (event.clientY - rect.top) / scale;
      canvas.scrollTo({
        left: Math.max(0, x * this.canvasZoom - canvas.clientWidth / 2),
        top: Math.max(0, y * this.canvasZoom - canvas.clientHeight / 2),
        behavior: "auto",
      });
    },
    changeMinimapZoom(delta) {
      this.minimapZoom = Math.max(0.72, Math.min(1.35, Number((this.minimapZoom + delta).toFixed(2))));
    },
    closeFloatingMenus() {
      this.nodeCreateMenu.open = false;
      this.referencePicker.open = false;
    },
    openNodeCreateMenu(event, sourceNodeId = "", title = "添加节点") {
      if (event?.target?.closest?.(".draggable-node, .command-bar, .minimap, .app-action-panel, .custom-panel")) return;
      this.nodeCreateMenu = {
        open: true,
        x: event.clientX,
        y: event.clientY,
        sourceNodeId,
        title,
      };
      this.referencePicker.open = false;
    },
    createNodeFromMenu(type) {
      const point = this.canvasPoint({ clientX: this.nodeCreateMenu.x, clientY: this.nodeCreateMenu.y });
      const node = this.addNode(type, { x: point.x, y: point.y });
      if (node && this.nodeCreateMenu.sourceNodeId) {
        this.completeConnection(this.nodeCreateMenu.sourceNodeId, node.id);
      }
      this.pendingConnection = "";
      this.closeFloatingMenus();
    },
    openReferencePicker(node, slot = "reference", event, mode = "node") {
      this.referencePicker = {
        open: true,
        x: event?.clientX || window.innerWidth / 2,
        y: event?.clientY || window.innerHeight / 2,
        targetNodeId: node?.id || "",
        slot,
        mode,
      };
      this.nodeCreateMenu.open = false;
    },
    applyReferenceToTarget(sourceNode) {
      const picker = this.referencePicker;
      if (picker.mode === "command") {
        this.commandRefs = {
          reference: {
            name: sourceNode.title,
            nodeId: sourceNode.id,
            url: sourceNode.image || sourceNode.video || "",
            type: sourceNode.type,
            fromCanvas: true,
          },
        };
        this.flash("已从画板插入参考素材");
        this.closeFloatingMenus();
        return;
      }
      const target = this.nodes.find((node) => node.id === picker.targetNodeId);
      if (!target) return;
      this.attachCanvasReference(target, sourceNode, picker.slot);
      this.closeFloatingMenus();
    },
    attachCanvasReference(target, source, slot = "reference") {
      target.refs ??= {};
      target.refs[slot] = {
        name: source.title,
        nodeId: source.id,
        url: source.image || source.video || "",
        type: source.type,
        fromCanvas: true,
      };
      target.sourceNodeIds = Array.from(new Set([...(target.sourceNodeIds || []), source.id]));
      if (slot === "reference" && source.image && target.type === "image") target.image = source.image;
      this.addHistory("引用素材", `${target.title} 已引用 ${source.title} 作为输入参考。`);
      this.flash("已引用画板节点");
    },
    handleReferenceUploadFromPicker(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const picker = this.referencePicker;
      const reader = new FileReader();
      reader.onload = () => {
        const ref = { name: file.name, url: String(reader.result), type: file.type };
        if (picker.mode === "command") {
          this.commandRefs = { reference: ref };
          this.flash("参考图已插入");
        } else {
          const target = this.nodes.find((node) => node.id === picker.targetNodeId);
          if (target) {
            target.refs ??= {};
            target.refs[picker.slot] = ref;
            if (picker.slot === "reference" && file.type.startsWith("image/") && target.type === "image") target.image = ref.url;
            this.addHistory("参考素材", `${target.title} 已添加参考图：${file.name}`);
            this.flash("参考素材已添加");
          }
        }
        this.closeFloatingMenus();
      };
      reader.readAsDataURL(file);
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
        audio: { width: 520, height: 260 },
        output: { width: 512, height: 520 },
        note: { width: 288, height: 300 },
      };
      const size = sizes[node.type] || { width: 320, height: 260 };
      const scale = node.scale || 1;
      return { width: size.width * scale, height: size.height * scale };
    },
    portPoint(node, side) {
      const size = this.nodeSize(node);
      const portY = generatedTypes.includes(node.type) ? 165 * (node.scale || 1) : size.height / 2;
      return {
        x: node.x + (side === "out" ? size.width : 0),
        y: node.y + portY,
      };
    },
    nodeStyle(node) {
      const scale = node.scale || 1;
      const isActive = this.selectedNodeIds.includes(node.id) || this.selectedNodeId === node.id;
      const isPending = this.pendingConnection === node.id;
      return {
        transform: `translate(${node.x}px, ${node.y}px) scale(${scale})`,
        zIndex: this.dragState?.id === node.id ? 40 : isPending ? 35 : isActive ? 25 : 1,
      };
    },
    selectNode(node) {
      this.selectedNodeId = node.id;
      this.selectedNodeIds = [node.id];
      if (generatedTypes.includes(node.type)) {
        this.progress = node.progress ?? 0;
        this.statusText = node.statusText || "等待生成";
        this.showTopProgress = true;
      }
    },
    startDrag(event, node) {
      if (event.target.closest("textarea, input, select, button, label")) return;
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
      const dx = (event.clientX - this.dragState.startX) / this.canvasZoom;
      const dy = (event.clientY - this.dragState.startY) / this.canvasZoom;
      node.x = Math.max(0, Math.round((this.dragState.originX + dx) / snap) * snap);
      node.y = Math.max(0, Math.round((this.dragState.originY + dy) / snap) * snap);
    },
    endDrag() {
      if (this.dragState) this.addHistory("节点拖拽", "节点位置已更新。");
      this.dragState = null;
      window.removeEventListener("pointermove", this.onDrag);
    },
    beginConnection(node, side = "out", event = null) {
      event?.stopPropagation?.();
      if (!this.pendingConnection) {
        this.pendingConnection = node.id;
        this.flash(`从“${node.title}”开始连线，再点击目标节点或空白处。`);
        return;
      }
      if (this.pendingConnection === node.id) {
        this.pendingConnection = "";
        return;
      }
      this.completeConnection(this.pendingConnection, node.id);
      this.pendingConnection = "";
    },
    completeConnection(fromId, toId) {
      if (!fromId || !toId || fromId === toId) return;
      const fromNode = this.nodes.find((item) => item.id === fromId);
      const target = this.nodes.find((item) => item.id === toId);
      if (!fromNode || !target) return;
      const edgeId = `edge-${Date.now()}`;
      const exists = this.edges.some((edge) => edge.from === fromId && edge.to === toId);
      if (!exists) {
        this.edges.push({ id: edgeId, from: fromId, to: toId });
      }
      this.attachCanvasReference(target, fromNode, "reference");
      this.addHistory("节点连线", `${target.title} 将读取 ${fromNode.title} 作为输入参考。`);
    },
    removeEdge(edgeId) {
      this.edges = this.edges.filter((edge) => edge.id !== edgeId);
      this.addHistory("删除连线", "已移除一条节点连线。");
    },
    addNode(type, position = null) {
      if (type === "prompt" || type === "process") {
        this.flash("画布中不再创建提示词或进度节点");
        return;
      }
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
                : type === "audio"
                  ? `音乐节点 ${count}`
                : `节点 ${count}`,
        x: position?.x ?? 120 + count * 42,
        y: position?.y ?? 120 + count * 46,
      };

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
      if (type === "audio") {
        Object.assign(
          base,
          normalizeNode({
            type: "audio",
            title: `音乐节点 ${count}`,
            caption: "音乐生成",
          }),
        );
      }

      this.nodes.push(base);
      this.selectedNodeId = id;
      this.selectedNodeIds = [id];
      if (generatedTypes.includes(type)) this.showTopProgress = true;
      this.activeActionPanel = "";
      this.addHistory("新增节点", `已创建${base.title}。`);
      this.flash(`${base.title} 已添加`);
      return base;
    },
    deleteNode(node) {
      if (this.nodes.length <= 1) return;
      this.nodes = this.nodes.filter((item) => item.id !== node.id);
      this.edges = this.edges.filter((edge) => edge.from !== node.id && edge.to !== node.id);
      this.selectedNodeId = mediaNodesFrom(this.nodes)[0]?.id || this.nodes[0]?.id || "";
      this.selectedNodeIds = this.selectedNodeId ? [this.selectedNodeId] : [];
      this.addHistory("删除节点", `已删除${node.title}。`);
    },
    deleteSelectedNodes() {
      const ids = this.selectedNodeIds.length ? this.selectedNodeIds : this.selectedNodeId ? [this.selectedNodeId] : [];
      if (!ids.length) return;
      const removable = ids;
      if (!removable.length) return;
      const set = new Set(removable);
      this.nodes = this.nodes.filter((node) => !set.has(node.id));
      this.edges = this.edges.filter((edge) => !set.has(edge.from) && !set.has(edge.to));
      this.selectedNodeId = mediaNodesFrom(this.nodes)[0]?.id || this.nodes[0]?.id || "";
      this.selectedNodeIds = this.selectedNodeId ? [this.selectedNodeId] : [];
      this.addHistory("删除节点", `已删除 ${removable.length} 个节点。`);
      this.flash("已删除选中节点");
    },
    modelChoicesFor(node) {
      return this.modelOptions[node.type] || this.modelOptions.image;
    },
    countOptionsFor(node) {
      return node.type === "video" || node.type === "audio" ? [1, 2, 3] : [1, 2, 3, 4];
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
    handleCommandReferenceUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.commandRefs = {
          reference: {
            name: file.name,
            url: String(reader.result),
            type: file.type,
          },
        };
        this.addHistory("参考图插入", `底部输入栏已插入参考图：${file.name}`);
        this.flash("参考图已插入");
      };
      reader.readAsDataURL(file);
    },
    generateFromNode(node) {
      this.selectedNodeId = node.id;
      this.showTopProgress = true;
      this.activeTool = node.type;
      if (node.model) this.selectedModels[this.activeTool] = node.model;
      const countLabel = node.type === "video" ? `${node.count || 1} 个视频` : node.type === "audio" ? `${node.count || 1} 条音频` : `${node.count || 1} 张图片`;
      this.addHistory("节点生成", `${node.title} 使用 ${node.model} 生成 ${countLabel}。`);
      this.startGeneration(node);
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
        const node = this.activeMediaNode || mediaNodesFrom(this.nodes)[0];
        if (node && text) node.prompt = text;
        if (node) {
          this.selectedNodeId = node.id;
          node.composerOpen = true;
        }
        this.activeActionPanel = "";
        this.addHistory("提示词导入", `已导入提示词文件：${file.name}`);
        this.flash("提示词已导入");
      };
      reader.readAsText(file, "utf-8");
    },
    createCommandNode() {
      const type = this.activeTool;
      if (!generatedTypes.includes(type)) return null;
      const count = this.nodes.filter((node) => node.type === type).length + 1;
      const canvas = this.$el.querySelector(".canvas");
      const x = Math.round(((canvas?.scrollLeft || 0) + 120) / this.canvasZoom);
      const y = Math.round(((canvas?.scrollTop || 0) + 170) / this.canvasZoom);
      const base = normalizeNode({
        id: `${type}-${Date.now()}`,
        type,
        title: type === "image" ? `图片节点 ${count}` : type === "video" ? `视频节点 ${count}` : `音乐节点 ${count}`,
        x,
        y,
        image: sampleOutputs[count % sampleOutputs.length],
        prompt: this.commandPrompt.trim(),
        model: this.selectedModels[type],
        ratio: "16:9",
        size: "2K",
        resolution: "480p",
        duration: "5s",
        count: 1,
        refs: clone(this.commandRefs || {}),
      });
      this.nodes.push(base);
      this.selectedNodeId = base.id;
      this.selectedNodeIds = [base.id];
      this.addHistory("新建生成节点", `${base.title} 已由底部输入栏创建。`);
      return base;
    },
    startGeneration(targetNode = null) {
      if (!targetNode && !this.commandPrompt.trim() && !Object.keys(this.commandRefs || {}).length) {
        this.flash("先输入提示词或插入参考图");
        return;
      }
      const node = targetNode || this.createCommandNode();
      if (!node || !generatedTypes.includes(node.type)) {
        this.flash("请先选择生成类型");
        return;
      }
      if (node.isGenerating || this.isGenerating) return;
      if (!String(node.prompt || "").trim() && !Object.keys(node.refs || {}).length) {
        this.flash("先输入提示词或插入参考图");
        return;
      }

      this.selectedNodeId = node.id;
      this.selectedNodeIds = [node.id];
      this.activeTool = node.type;
      this.selectedModels[this.activeTool] = node.model || this.selectedModels[this.activeTool];
      this.showTopProgress = true;
      this.isGenerating = true;
      node.isGenerating = true;
      node.progress = 6;
      node.statusText = `正在使用 ${node.model || this.selectedModels[this.activeTool]} 生成`;
      this.progress = node.progress;
      this.statusText = node.statusText;
      this.addHistory("开始生成", `${node.title} 已开始生成。`);

      const steps = [
        [20, "正在读取节点提示词"],
        [42, "正在分析参考素材"],
        [63, node.type === "audio" ? "正在合成音乐结构" : "正在合成画面内容"],
        [84, node.type === "audio" ? "正在生成音频结果" : "正在渲染输出"],
        [100, "生成完成"],
      ];
      let index = 0;

      clearInterval(this.generateTimer);
      this.generateTimer = setInterval(() => {
        const [nextProgress, nextStatus] = steps[index];
        node.progress = nextProgress;
        node.statusText = nextStatus;
        this.progress = node.progress;
        this.statusText = node.statusText;
        index += 1;

        if (node.progress >= 100) {
          clearInterval(this.generateTimer);
          node.isGenerating = false;
          this.isGenerating = false;
          const nextPatch = Number(this.outputVersion.split(".").at(-1) || 4) + 1;
          const nextImage = sampleOutputs[(this.variants.length + 1) % sampleOutputs.length];
          this.outputVersion = `V 2.0.${nextPatch}`;
          const output = this.outputNode;
          if (output) output.image = nextImage;
          if (node.type === "image") node.image = nextImage;
          if (node.type === "video") node.image = nextImage;
          this.lastGeneratedNodeId = node.id;
          this.variants = this.variants.map((item) => ({ ...item, selected: false }));
          this.variants.unshift({ version: this.outputVersion, image: nextImage, time: nowLabel(), selected: true });
          this.variants = this.variants.slice(0, 8);
          this.addHistory("成功生成", `${node.title} 已完成生成，进度 100%。`);
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
    focusLastGeneratedNode() {
      const node = this.nodes.find((item) => item.id === this.lastGeneratedNodeId) || mediaNodesFrom(this.nodes).at(-1);
      if (!node) {
        this.flash("还没有生成结果节点");
        return;
      }
      this.selectedNodeId = node.id;
      this.selectedNodeIds = [node.id];
      const canvas = this.$el.querySelector(".canvas");
      canvas?.scrollTo({
        left: Math.max(0, node.x * this.canvasZoom - 160),
        top: Math.max(0, node.y * this.canvasZoom - 140),
        behavior: "smooth",
      });
      this.addHistory("生成结果", `已定位到最后生成的节点：${node.title}`);
    },
    showNodeMaterials() {
      this.activeHistoryTab = "素材库";
      this.historyOpen = true;
      this.addHistory("节点素材", "已在右侧素材库显示当前节点素材记录。");
      this.flash("节点素材已打开");
    },
    resetWorkflow() {
      clearInterval(this.generateTimer);
      localStorage.removeItem(STORAGE_KEY);
      this.nodes = cleanNodes(clone(defaultNodes));
      this.edges = cleanEdges(clone(defaultEdges), this.nodes);
      this.selectedNodeId = mediaNodesFrom(this.nodes)[0]?.id || this.nodes[0]?.id || "";
      this.progress = 0;
      this.statusText = "等待生成";
      this.showTopProgress = true;
      this.outputVersion = "V 2.0.4";
      this.variants = [
        { version: "V 2.0.4", image: sampleOutputs[0], time: "14:12", selected: true },
        { version: "V 2.0.3", image: sampleOutputs[1], time: "13:46", selected: false },
      ];
      this.historyItems = [{ status: "项目重置", time: nowLabel(), detail: "已恢复到默认节点项目。", highlight: true }];
      this.flash("已重置");
    },
    resetNodePositions() {
      const mediaNodes = mediaNodesFrom(this.nodes);
      if (!mediaNodes.length) {
        this.flash("当前没有图片或视频节点");
        return;
      }

      const canvas = this.$el.querySelector(".canvas");
      const rect = canvas?.getBoundingClientRect() || { width: 1200, height: 760 };
      const baseWidth = 610;
      const baseHeight = 640;
      const gap = 44;
      const availableWidth = Math.max(520, rect.width - 120);
      const availableHeight = Math.max(420, rect.height - 210);
      let scale = Math.min(1, (availableWidth - gap * (mediaNodes.length - 1)) / (baseWidth * mediaNodes.length));
      scale = Math.max(0.52, Math.min(1, scale));
      let columns = Math.max(1, Math.floor((availableWidth + gap) / (baseWidth * scale + gap)));
      let rows = Math.ceil(mediaNodes.length / columns);
      const heightScale = (availableHeight - gap * (rows - 1)) / (baseHeight * rows);
      if (heightScale < scale) {
        scale = Math.max(0.46, Math.min(scale, heightScale));
        columns = Math.max(1, Math.floor((availableWidth + gap) / (baseWidth * scale + gap)));
        rows = Math.ceil(mediaNodes.length / columns);
      }

      const startX = 56;
      const startY = 132;
      mediaNodes.forEach((node, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        node.scale = Number(scale.toFixed(2));
        node.x = Math.round(startX + column * (baseWidth * scale + gap));
        node.y = Math.round(startY + row * (baseHeight * scale + gap));
      });

      const mediaEdges = mediaNodes.slice(0, -1).map((node, index) => ({
        id: `edge-media-${index + 1}-${Date.now()}`,
        from: node.id,
        to: mediaNodes[index + 1].id,
      }));
      const otherEdges = this.edges.filter((edge) => {
        const from = this.nodes.find((node) => node.id === edge.from);
        const to = this.nodes.find((node) => node.id === edge.to);
        return !from || !to || !["image", "video"].includes(from.type) || !["image", "video"].includes(to.type);
      });
      this.edges = [...otherEdges, ...mediaEdges];
      this.selectedNodeId = mediaNodes[0].id;
      this.showTopProgress = true;
      canvas?.scrollTo({ left: 0, top: 0, behavior: "auto" });
      this.addHistory("画布整理", "图片和视频节点已按队列规整并自动连接。");
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
  mounted() {
    window.addEventListener("keydown", this.onKeyDown);
  },
  beforeUnmount() {
    clearInterval(this.generateTimer);
    clearTimeout(this.toastTimer);
    window.removeEventListener("pointermove", this.onDrag);
    window.removeEventListener("pointermove", this.onSelectMove);
    window.removeEventListener("keydown", this.onKeyDown);
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
          <main :class="canvasClasses" aria-label="工作流画布" @wheel="handleCanvasWheel" @scroll="syncCanvasScroll" @pointerdown="startCanvasSelection" @click="handleCanvasClick" @dblclick="openNodeCreateMenu($event)">
            <template v-if="activeView === 'canvas'">
              <div v-if="showTopProgress" class="top-progress-strip">
                <span>{{ displayProgressText }}</span>
                <div class="top-progress-track">
                  <i :style="{ width: displayProgress + '%' }"></i>
                </div>
                <b>{{ displayProgress }}%</b>
                <button aria-label="关闭进度条" @click="showTopProgress = false">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
              <div class="canvas-world" :style="canvasWorldStyle">
                <div class="canvas-content" :style="canvasContentStyle">
                  <svg class="connection-layer" width="2100" height="1000" aria-label="节点连线">
                    <path
                      v-for="edge in edgePaths"
                      :key="edge.id"
                      :d="edge.path"
                      @click="removeEdge(edge.id)"
                    />
                  </svg>

                  <div v-if="selectionBox" class="selection-box" :style="selectionBoxStyle"></div>

                  <section class="node-stage">
                    <article
                      v-for="node in nodes"
                      :key="node.id"
                      :class="['draggable-node', 'node-card', node.type + '-node', { selected: selectedNodeIds.includes(node.id) || selectedNodeId === node.id, pending: pendingConnection === node.id }]"
                  :style="nodeStyle(node)"
                  @pointerdown="startDrag($event, node)"
                  @click="pendingConnection && pendingConnection !== node.id ? beginConnection(node) : selectNode(node)"
                >
                  <button class="side-port side-port-left" title="连接节点" @pointerdown.stop @click.stop="beginConnection(node, 'in', $event)">
                    <span>+</span>
                  </button>
                  <button class="side-port side-port-right" title="连接节点" @pointerdown.stop @click.stop="beginConnection(node, 'out', $event)">
                    <span>+</span>
                  </button>
                  <div class="node-meta">
                    <span>{{ node.type.toUpperCase() }}</span>
                    <div class="node-actions">
                      <button class="node-port" title="连接节点" @pointerdown.stop @click.stop="beginConnection(node, 'out', $event)">
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
                      <img :src="node.image" alt="图片节点预览" draggable="false" />
                      <button class="media-add-button" title="添加参考图" @pointerdown.stop @click.stop="openReferencePicker(node, 'reference', $event)">
                        <span class="material-symbols-outlined">add</span>
                      </button>
                      <button class="composer-toggle" @click.stop="node.composerOpen = !node.composerOpen">
                        <span class="material-symbols-outlined">{{ node.composerOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</span>
                        {{ node.composerOpen ? '隐藏生成设置' : '打开生成设置' }}
                      </button>
                    </div>
                    <section v-if="node.composerOpen" class="generation-composer">
                      <div class="composer-toolbar">
                        <button class="composer-icon-button" title="添加参考图" @click="openReferencePicker(node, 'reference', $event)">
                          <span class="material-symbols-outlined">add_photo_alternate</span>
                          <b>添加参考图</b>
                        </button>
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
                      <img v-else :src="node.image" alt="视频节点封面" draggable="false" />
                      <span v-if="!node.video" class="play-placeholder material-symbols-outlined">play_arrow</span>
                      <button class="media-add-button" title="上传视频或封面" @pointerdown.stop @click.stop="openReferencePicker(node, 'reference', $event)">
                        <span class="material-symbols-outlined">add</span>
                      </button>
                      <button class="composer-toggle" @click.stop="node.composerOpen = !node.composerOpen">
                        <span class="material-symbols-outlined">{{ node.composerOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</span>
                        {{ node.composerOpen ? '隐藏生成设置' : '打开生成设置' }}
                      </button>
                    </div>
                    <section v-if="node.composerOpen" class="generation-composer video-composer">
                      <div class="composer-toolbar">
                        <button class="composer-icon-button" title="添加首帧" @click="openReferencePicker(node, 'firstFrame', $event)">
                          <span class="material-symbols-outlined">first_page</span>
                          <b>首帧</b>
                        </button>
                        <button class="composer-icon-button" title="添加尾帧" @click="openReferencePicker(node, 'lastFrame', $event)">
                          <span class="material-symbols-outlined">last_page</span>
                          <b>尾帧</b>
                        </button>
                        <button class="composer-icon-button" title="添加参考图" @click="openReferencePicker(node, 'reference', $event)">
                          <span class="material-symbols-outlined">add_photo_alternate</span>
                          <b>参考图</b>
                        </button>
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

                  <template v-else-if="node.type === 'audio'">
                    <div class="media-node-label">
                      <span class="material-symbols-outlined">graphic_eq</span>
                      <strong>音乐节点</strong>
                    </div>
                    <section class="audio-node-body">
                      <span class="material-symbols-outlined">music_note</span>
                      <h2>{{ node.title }}</h2>
                      <p>{{ node.prompt || '输入提示词后生成音乐或音频' }}</p>
                      <div class="audio-wave"><i></i><i></i><i></i><i></i><i></i></div>
                    </section>
                    <section v-if="node.composerOpen" class="generation-composer">
                      <div class="composer-toolbar">
                        <button class="composer-icon-button" title="添加参考图" @click="openReferencePicker(node, 'reference', $event)">
                          <span class="material-symbols-outlined">add_photo_alternate</span>
                          <b>添加参考图</b>
                        </button>
                        <div v-if="node.refs?.reference" class="ref-chip">
                          <img :src="node.refs.reference.url" alt="" />
                          <span>{{ node.refs.reference.name }}</span>
                        </div>
                      </div>
                      <textarea v-model="node.prompt" rows="3" placeholder="描述你想生成的音乐、旁白或环境音"></textarea>
                      <div class="composer-controls">
                        <select v-model="node.model">
                          <option v-for="model in modelOptions.audio" :key="model.name" :value="model.name">{{ model.name }}</option>
                        </select>
                        <select v-model.number="node.count">
                          <option v-for="count in [1, 2, 3]" :key="count" :value="count">{{ count }} 条</option>
                        </select>
                      </div>
                      <div class="composer-footer">
                        <span>{{ node.model }} · {{ node.count || 1 }} 条</span>
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
                </div>
              </div>
            </template>

            <section v-else class="board-view" aria-label="工作流看板">
              <article v-for="card in boardCards" :key="card.title" class="board-card">
                <span>{{ card.meta }}</span>
                <h2>{{ card.title }}</h2>
                <p>{{ card.detail }}</p>
              </article>
            </section>

            <aside class="minimap" :class="{ collapsed: minimapCollapsed }" :style="minimapPanelStyle" aria-label="画布全景图">
              <header>
                <span>画布全景图</span>
                <div class="minimap-actions">
                  <button class="mini-icon" @click="changeMinimapZoom(-0.08)" aria-label="缩小全景图">
                    <span class="material-symbols-outlined">remove</span>
                  </button>
                  <button class="mini-icon" @click="changeMinimapZoom(0.08)" aria-label="放大全景图">
                    <span class="material-symbols-outlined">add</span>
                  </button>
                  <button class="mini-icon" @click="minimapCollapsed = !minimapCollapsed" aria-label="最小化全景图">
                    <span class="material-symbols-outlined">{{ minimapCollapsed ? 'open_in_full' : 'remove_selection' }}</span>
                  </button>
                </div>
              </header>
              <div v-if="!minimapCollapsed" class="minimap-body" @click="jumpMinimap">
                <i
                  v-for="node in nodes"
                  :key="node.id"
                  :class="['map-node', node.type]"
                  :style="minimapNodeStyle(node)"
                ></i>
                <i class="viewport" :style="minimapViewportStyle"></i>
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

              <template v-else-if="activeActionPanel === '视图'">
                <button class="action-card" @click="resetNodePositions">
                  <span class="material-symbols-outlined">dashboard_customize</span>
                  <strong>整理画布节点</strong>
                  <small>图片和视频节点排队连接</small>
                </button>
                <button class="action-card" @click="showCustomPanel = true">
                  <span class="material-symbols-outlined">palette</span>
                  <strong>打开界面设置</strong>
                  <small>主题、背景、连接线</small>
                </button>
              </template>

              <template v-else-if="activeActionPanel === '工作流'">
                <button class="action-card" @click="chooseSaveFolder">
                  <span class="material-symbols-outlined">folder_open</span>
                  <strong>保存到本地</strong>
                  <small>{{ saveTargetPath }}</small>
                </button>
                <button class="action-card" @click="exportProjectJson">
                  <span class="material-symbols-outlined">data_object</span>
                  <strong>导出项目 JSON</strong>
                  <small>包含节点与连线数据</small>
                </button>
              </template>

              <template v-else-if="activeActionPanel === '资产库'">
                <button class="action-card" @click="focusLastGeneratedNode">
                  <span class="material-symbols-outlined">collections</span>
                  <strong>生成结果</strong>
                  <small>定位到最后生成的节点</small>
                </button>
                <button class="action-card" @click="showNodeMaterials">
                  <span class="material-symbols-outlined">inventory_2</span>
                  <strong>节点素材</strong>
                  <small>查看当前项目素材记录</small>
                </button>
              </template>

              <template v-else-if="activeActionPanel === '插件'">
                <button class="action-card" @click="openModelPicker('image')">
                  <span class="material-symbols-outlined">auto_awesome</span>
                  <strong>图片生成模型</strong>
                  <small>当前：{{ selectedModels.image }}</small>
                </button>
                <button class="action-card" @click="openModelPicker('video')">
                  <span class="material-symbols-outlined">movie</span>
                  <strong>视频生成模型</strong>
                  <small>当前：{{ selectedModels.video }}</small>
                </button>
                <button class="action-card" @click="flash('批量生成插件已准备')">
                  <span class="material-symbols-outlined">dynamic_form</span>
                  <strong>批量生成</strong>
                  <small>按节点队列连续生成</small>
                </button>
              </template>

              <template v-else>
                <button class="action-card" @click="flash('指令面板已连接当前节点')">
                  <span class="material-symbols-outlined">terminal</span>
                  <strong>节点指令</strong>
                  <small>对当前节点执行快捷操作</small>
                </button>
                <button class="action-card" @click="resetNodePositions">
                  <span class="material-symbols-outlined">account_tree</span>
                  <strong>重排并连接</strong>
                  <small>整理图片和视频节点队列</small>
                </button>
              </template>
            </aside>

            <form class="command-bar" @submit.prevent="startGeneration()">
              <button type="button" class="command-ref-button" title="添加参考图" @click="openReferencePicker(null, 'reference', $event, 'command')">
                <span class="material-symbols-outlined">add</span>
                <b>插入参考图</b>
              </button>
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

            <section v-if="modelPickerOpen" class="model-picker bottom-model-picker" aria-label="模型选择">
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

            <section
              v-if="nodeCreateMenu.open"
              class="canvas-popup create-node-menu"
              :style="{ left: nodeCreateMenu.x + 'px', top: nodeCreateMenu.y + 'px' }"
            >
              <h3>{{ nodeCreateMenu.title }}</h3>
              <button @click="createNodeFromMenu('image')">
                <span class="material-symbols-outlined">image</span>
                <strong>图片生成</strong>
                <small>生成或添加图片节点</small>
              </button>
              <button @click="createNodeFromMenu('video')">
                <span class="material-symbols-outlined">smart_display</span>
                <strong>视频生成</strong>
                <small>生成或添加视频节点</small>
              </button>
              <button v-if="!nodeCreateMenu.sourceNodeId" @click="createNodeFromMenu('audio')">
                <span class="material-symbols-outlined">graphic_eq</span>
                <strong>音频节点</strong>
                <small>生成音乐或音频</small>
              </button>
              <label v-if="!nodeCreateMenu.sourceNodeId">
                <span class="material-symbols-outlined">upload</span>
                <strong>上传参考图</strong>
                <small>插入到底部输入栏</small>
                <input type="file" accept="image/*" @change="handleCommandReferenceUpload" />
              </label>
            </section>

            <section
              v-if="referencePicker.open"
              class="canvas-popup reference-picker"
              :style="{ left: referencePicker.x + 'px', top: referencePicker.y + 'px' }"
            >
              <h3>选择参考素材</h3>
              <button
                v-for="node in canvasReferenceNodes"
                :key="node.id"
                @click="applyReferenceToTarget(node)"
              >
                <span class="material-symbols-outlined">{{ node.type === 'video' ? 'smart_display' : node.type === 'audio' ? 'graphic_eq' : 'image' }}</span>
                <strong>{{ node.title }}</strong>
                <small>从画板选择</small>
              </button>
              <label>
                <span class="material-symbols-outlined">upload</span>
                <strong>上传本地图片</strong>
                <small>从电脑选择参考图</small>
                <input type="file" accept="image/*" @change="handleReferenceUploadFromPicker" />
              </label>
            </section>
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
