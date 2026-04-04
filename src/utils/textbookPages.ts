import { get } from 'svelte/store';
import {
	expandedBlock,
	weightPopover,
	isBoundingBoxActive,
	textbookCurrentPageId,
	isExpandOrCollapseRunning,
	isFetchingModel,
	userId
} from '~/store';
import {
	highlightElements,
	removeHighlightFromElements,
	applyTransformerBoundingHeight,
	resetElementsHeight,
	highlightAttentionPath,
	removeAttentionPathHighlight,
	removeFingerFromElements
} from '~/utils/textbook';
import { drawResidualLine } from './animation';

export interface TextbookPage {
	id: string;
	title: string;
	content?: string;
	component?: any;
	timeoutId?: number;
	on: () => void;
	out: () => void;
	complete?: () => void;
}

const { drawLine, removeLine } = drawResidualLine();

export const textPages: TextbookPage[] = [
	{
		id: 'what-is-transformer',
		title: '什么是 Transformer?',
		content: `<p><strong>Transformer</strong> 是现代 AI 背后的核心架构，驱动着 ChatGPT 和 Gemini 等模型。它于 2017 年提出，彻底改变了 AI 处理信息的方式。同一架构既用于在海量数据上训练，也用于推理 (Inference) 以生成输出。这里我们使用 GPT-2 (small)，它比新模型更简单，但非常适合学习基本原理。</p>
`,
		on: () => {},
		out: () => {}
	},
	{
		id: 'how-transformers-work',
		title: 'Transformer 如何工作?',
		content: `<p>Transformer 并非魔法——它通过逐步构建文本来工作，每一步都在问：</p>
	<blockquote class="question">
		"跟在这段输入后面，最可能的下一个词是什么？"
	</blockquote>
	<p>这里我们探索一个训练好的模型如何生成文本。输入你自己的文本或使用示例，然后点击 <strong>Generate</strong> 来观察实际效果。如果模型尚未就绪，请尝试另一个 <strong>Example</strong>。</p>`,
		on: () => {
			highlightElements(['.input-form']);
			if (get(isFetchingModel)) {
				highlightElements(['.input-form .select-button']);
			} else {
				highlightElements(['.input-form .generate-button']);
			}
		},
		out: () => {
			removeHighlightFromElements([
				'.input-form',
				'.input-form .select-button',
				'.input-form .generate-button'
			]);
		},
		complete: () => {
			removeFingerFromElements(['.input-form .select-button', '.input-form .generate-button']);
			if (get(textbookCurrentPageId) === 'how-transformers-work') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'how-transformers-work'
				});
			}
		}
	},
	{
		id: 'transformer-architecture',
		title: 'Transformer 架构',
		content:
			'<p>Transformer 有三个主要部分：</p><div class="numbered-list"><div class="numbered-item"><span class="number-circle">1</span><div class="item-content"><strong>嵌入 (Embedding)</strong> 将文本转换为数字。</div></div><div class="numbered-item"><span class="number-circle">2</span><div class="item-content"><strong>Transformer 块 (Block)</strong> 通过自注意力 (Self-Attention) 混合信息，并通过 MLP 进行细化。</div></div><div class="numbered-item"><span class="number-circle">3</span><div class="item-content"><strong>概率 (Probabilities)</strong> 确定每个下一个 token 的可能性。</div></div></div>',
		on: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			highlightElements(selectors);
			applyTransformerBoundingHeight(['.softmax-bounding', '.embedding-bounding']);
		},
		out: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			removeHighlightFromElements(selectors);
			resetElementsHeight(['.softmax-bounding', '.embedding-bounding']);
		}
	},
	{
		id: 'embedding',
		title: '嵌入 (Embedding)',
		content: `<p>在 Transformer 使用文本之前，它首先将文本拆分为小单元，并将每个单元表示为一组数字（向量）。这个过程称为<strong>嵌入 (Embedding)</strong>，该术语既可以指这个过程，也可以指得到的向量。</p><p>在本工具中，每个向量显示为一个矩形，将鼠标悬停在上面可以查看其维度大小。</p>`,
		on: () => {
			highlightElements(['.step.embedding .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.embedding .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.embedding .title']);
			if (get(textbookCurrentPageId) === 'embedding') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'embedding'
				});
			}
		}
	},
	{
		id: 'token-embedding',
		title: 'Token 嵌入 (Token Embedding)',
		content: `<p><strong>分词 (Tokenization)</strong> 将输入文本拆分为 token——单词或词的一部分等小单元。GPT-2 (small) 拥有 50,257 个 token 的词表，每个都有唯一的 ID。</p><p>在 <strong>token 嵌入</strong>步骤中，每个 token 从一个大型查找表中匹配到一个 768 维的数字向量。这些向量在训练过程中学习得到，以最佳方式表示每个 token 的含义。</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'positional-encoding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'positional-encoding',
		title: '位置编码 (Positional Encoding)',
		content: `<p>语言中词序很重要。<strong>位置编码 (Positional Encoding)</strong> 为每个 token 提供其在序列中位置的信息。</p><p>GPT-2 通过将学习到的位置嵌入加到 token 嵌入上来实现这一点，但更新的模型可能使用其他方法，例如 RoPE，它通过旋转特定向量来编码位置。所有方法的目标都是帮助模型理解文本中的顺序。</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'token-embedding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'blocks',
		title: '重复的 Transformer 块 (Block)',
		content: `<p><strong>Transformer 块</strong>是模型的主要处理单元。它有两个部分：</p><ul><li><strong>多头自注意力 (Multi-head Self-Attention)</strong> —— 让 token 之间共享信息</li><li><strong>MLP</strong> —— 细化每个 token 的表示</li></ul><p>模型堆叠多个块，使 token 的表示在逐层传递中变得越来越丰富。GPT-2 (small) 有 12 个这样的块。</p>`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements([
						'.transformer-bounding',
						'.step.transformer-blocks .guide',
						'.attention > .title',
						'.mlp > .title'
					]);
					highlightElements(['.transformer-bounding-title'], 'textbook-button-highlight');
					isBoundingBoxActive.set(true);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.transformer-bounding',
				'.step.transformer-blocks .guide',
				'.attention > .title',
				'.mlp > .title'
			]);
			removeHighlightFromElements(['.transformer-bounding-title'], 'textbook-button-highlight');
			isBoundingBoxActive.set(false);
		},
		complete: () => {
			removeFingerFromElements(['.transformer-bounding-title']);
			if (get(textbookCurrentPageId) === 'blocks') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'blocks'
				});
			}
		}
	},
	{
		id: 'self-attention',
		title: '多头自注意力 (Multi-Head Self Attention)',
		content:
			'<p><strong>自注意力 (Self-Attention)</strong> 让模型决定输入中哪些部分与每个 token 最相关。这有助于捕捉含义和关系，即使是相距很远的词之间的关系。</p><p>在<strong>多头 (Multi-head)</strong> 形式中，模型并行运行多个注意力过程，每个关注文本中不同的模式。</p>',
		on: () => {
			highlightElements(['.step.attention']);
		},
		out: () => {
			removeHighlightFromElements(['.step.attention']);
		}
	},
	{
		id: 'qkv',
		title: '查询、键、值 (Query, Key, Value)',
		content: `
	<p>为了执行自注意力，每个 token 的嵌入被变换为
  <span class="highlight">三个新的嵌入</span>——
  <span class="blue">查询 (Query)</span>、
  <span class="red">键 (Key)</span> 和
  <span class="green">值 (Value)</span>。
  这种变换通过对每个 token 嵌入施加不同的权重和偏置来完成。这些参数（权重和偏置）在训练过程中优化得到。</p>

<p>创建后，<span class="blue">Query</span> 与 <span class="red">Key</span> 进行比较以衡量相关性，然后用这种相关性对 <span class="green">Value</span> 进行加权。</p>
`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.step.qkv .qkv-column']);
			if (get(textbookCurrentPageId) === 'qkv') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'qkv'
				});
			}
		}
	},

	{
		id: 'multi-head',
		title: '多头 (Multi-head)',
		content:
			'<p>在创建 <span class="blue">Q</span>、<span class="red">K</span> 和 <span class="green">V</span> 嵌入后，模型将它们拆分为多个<strong>头 (Head)</strong>（GPT-2 small 中有 12 个）。每个头使用自己较小的 <span class="blue">Q</span>/<span class="red">K</span>/<span class="green">V</span> 子集，关注文本中不同的模式——例如语法、语义或长距离依赖。</p><p>多个头让模型能够并行学习多种类型的关系，使其理解更加丰富。</p>',
		on: () => {
			highlightAttentionPath();
			highlightElements(['.multi-head .head-title']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.multi-head .head-title']);
		},
		complete: () => {
			removeFingerFromElements(['.multi-head .head-title']);
			if (get(textbookCurrentPageId) === 'multi-head') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'multi-head'
				});
			}
		}
	},
	{
		id: 'masked-self-attention',
		title: '掩码自注意力 (Masked Self Attention)',
		content: `<p>在每个头中，模型决定每个 token 对其他 token 的关注程度：</p><ul><li><strong>点积 (Dot Product)</strong> —— 将 <span class="blue">Query</span>/<span class="red">Key</span> 向量中对应的数字相乘并求和，得到<span class="purple">注意力分数 (Attention Score)</span>。</li><li><strong>掩码 (Mask)</strong> —— 隐藏未来的 token，防止模型"偷看"后面的内容。</li><li><strong>Softmax</strong> —— 将分数转换为概率，每行之和为 1，表示对前面 token 的关注程度。</li></ul>`,
		on: () => {
			highlightAttentionPath();
			highlightElements(['.attention-matrix.attention-result']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.attention-matrix.attention-result']);
			expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.attention-matrix.attention-result']);
			if (get(textbookCurrentPageId) === 'masked-self-attention') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'masked-self-attention'
				});
			}
		}
	},
	{
		id: 'output-concatenation',
		title: '注意力输出与拼接 (Attention Output & Concatenation)',
		content:
			'<p>每个头<span class="highlight">将其<span class="purple">注意力分数</span>与 <span class="green">Value</span> 嵌入相乘，生成注意力输出</span>——即在考虑上下文后，对每个 token 的细化表示。</p><p>GPT-2 (small) 有 12 个这样的输出，它们被拼接 (Concatenate) 成一个与原始大小相同的单一向量（768 维）。</p>',
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.attention .column.out']);
			if (get(textbookCurrentPageId) === 'output-concatenation') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-concatenation'
				});
			}
		}
	},
	{
		id: 'mlp',
		title: 'MLP (多层感知机)',
		content:
			'<p>注意力输出经过 <strong>MLP</strong> 来细化 token 的表示。线性层 (Linear Layer) 使用学习到的权重和偏置来改变嵌入的值和大小，然后非线性激活函数决定每个值通过的程度。</p><p>激活函数有很多种；GPT-2 使用 <strong>GELU</strong>，它让小值部分通过，大值完全通过，有助于捕捉细微和强烈的模式。</p>',
		on: () => {
			highlightElements(['.step.mlp', '.operation-col.activation']);
		},
		out: () => {
			removeHighlightFromElements(['.step.mlp', '.operation-col.activation']);
		}
	},

	{
		id: 'output-logit',
		title: '输出 Logit',
		content: `<p>经过所有 Transformer 块后，最后一个 token 的输出嵌入（已融合了所有前面 token 的上下文信息）会与最终层中学习到的权重相乘。</p><p>这产生了 <strong>logits</strong>，即 50,257 个数字——对应 GPT-2 词表中的每一个 token——表示每个 token 作为下一个词的可能性大小。</p>`,
		on: () => {
			highlightElements(['g.path-group.softmax', '.column.final']);
		},
		out: () => {
			removeHighlightFromElements(['g.path-group.softmax', '.column.final']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.column.final']);
			if (get(textbookCurrentPageId) === 'output-logit') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-logit'
				});
			}
		}
	},
	{
		id: 'output-probabilities',
		title: '概率 (Probabilities)',
		content:
			'<p>Logits 只是原始分数。为了更易于理解，我们将它们转换为 0 到 1 之间的<strong>概率</strong>，所有概率之和为 1。这告诉我们每个 token 成为下一个词的可能性。</p><p>我们不一定总是选择概率最高的 token，而是可以使用不同的选择策略来平衡生成文本的安全性和创造性。</p>',
		on: () => {
			highlightElements(['.step.softmax .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.softmax .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.softmax .title']);
			if (get(textbookCurrentPageId) === 'output-probabilities') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-probabilities'
				});
			}
		}
	},
	{
		id: 'temperature',
		title: '温度 (Temperature)',
		content:
			'<p><strong>温度 (Temperature)</strong> 通过在将 logits 转换为概率之前对其进行缩放来起作用。<strong>低温度</strong>（如 0.2）使大 logit 更大、小 logit 更小，倾向于选择得分最高的 token，从而产生更<strong>可预测的选择</strong>。<strong>高温度</strong>（如 1.0 或更高）则拉平差异，使不太可能的 token 更有竞争力，从而产生更<strong>有创意的输出</strong>。</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.scaled',
						'.title-box.scaled',
						'.content-box.scaled',
						'.temperature-input'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.scaled',
					'.title-box.scaled',
					'.content-box.scaled',
					'.temperature-input'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.scaled',
				'.title-box.scaled',
				'.temperature-input',
				'.content-box.scaled'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.temperature-input']);
			if (get(textbookCurrentPageId) === 'temperature') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'temperature'
				});
			}
		}
	},
	{
		id: 'sampling',
		title: '采样策略 (Sampling Strategy)',
		content:
			'<p>最后，我们需要一种策略来选择下一个 token。策略有很多种，以下是常见的几种：贪心搜索 (Greedy Search) 选择概率最高的。<strong>Top-k</strong> 只保留 k 个最可能的 token，而 <strong>Top-p</strong> 保留总概率至少为 p 的最小集合——尽早剔除不太可能的 token。</p><p>然后 softmax 将剩余的 logits 转换为概率，从允许的集合中随机选择一个 token。</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.sampling',
						'.title-box.sampling',
						'.sampling-input',
						'.content-box.sampling'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.sampling',
					'.title-box.sampling',
					'.sampling-input',
					'.content-box.sampling'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.sampling',
				'.title-box.sampling',
				'.sampling-input',
				'.content-box.sampling'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.sampling-input']);
			if (get(textbookCurrentPageId) === 'sampling') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'sampling'
				});
			}
		}
	},
	{
		id: 'residual',
		title: '残差连接 (Residual Connection)',
		content: `<p>Transformer 有一些辅助特性来增强模型性能。例如，<strong>残差连接 (Residual Connection)</strong> 将某层的输入加到其输出上，防止信息在经过多个块后逐渐消失。在 GPT-2 中，每个块使用两次残差连接，以有效训练更深的网络。</p>`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['.operation-col.residual', '.residual-start']);
					drawLine();
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['.operation-col.residual', '.residual-start']);
			removeLine();
		}
	},
	{
		id: 'layer-normalization',
		title: '层归一化 (Layer Normalization)',
		content: `<p><strong>层归一化 (Layer Normalization)</strong> 通过调整输入数字使其均值和方差保持一致，来帮助稳定训练和推理过程。这使得模型对初始权重不那么敏感，并帮助其更有效地学习。在 GPT-2 中，它在自注意力之前、MLP 之前以及最终输出之前各应用一次。</p>`,
		on: () => {
			highlightElements(['.operation-col.ln']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.ln']);
		}
	},
	{
		id: 'dropout',
		title: 'Dropout (随机丢弃)',
		content: `<p>在训练过程中，<strong>Dropout</strong> 随机关闭一些数值之间的连接，防止模型对特定模式过拟合 (Overfit)。这有助于模型学习到泛化能力更强的特征。GPT-2 使用了 Dropout，但更新的 LLM 通常跳过它，因为它们在海量数据集上训练，过拟合的问题不那么严重。在推理阶段，Dropout 被关闭。</p>`,
		on: () => {
			highlightElements(['.operation-col.dropout']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.dropout']);
		}
	}
	// {
	// 	id: 'final',
	// 	title: `Let's explore!`,
	// 	content: '',
	// 	on: () => {},
	// 	out: () => {}
	// }
];
