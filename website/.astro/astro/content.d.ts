declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		
	};

	type DataEntryMap = {
		"skills": {
"ace-taffy-skill": {
	id: "ace-taffy-skill";
  collection: "skills";
  data: any
};
"addyosmani-agent-skills": {
	id: "addyosmani-agent-skills";
  collection: "skills";
  data: any
};
"adele-teacher-skill": {
	id: "adele-teacher-skill";
  collection: "skills";
  data: any
};
"agent-skill-distiller": {
	id: "agent-skill-distiller";
  collection: "skills";
  data: any
};
"agentskills-spec": {
	id: "agentskills-spec";
  collection: "skills";
  data: any
};
"anthropic-skills": {
	id: "anthropic-skills";
  collection: "skills";
  data: any
};
"anti-colleague-skill": {
	id: "anti-colleague-skill";
  collection: "skills";
  data: any
};
"anti-distill": {
	id: "anti-distill";
  collection: "skills";
  data: any
};
"anyone-to-skill": {
	id: "anyone-to-skill";
  collection: "skills";
  data: any
};
"arknights-operator-skill": {
	id: "arknights-operator-skill";
  collection: "skills";
  data: any
};
"awesome-agent-skills-voltagent": {
	id: "awesome-agent-skills-voltagent";
  collection: "skills";
  data: any
};
"awesome-claude-skills-composio": {
	id: "awesome-claude-skills-composio";
  collection: "skills";
  data: any
};
"awesome-codex-skills": {
	id: "awesome-codex-skills";
  collection: "skills";
  data: any
};
"awesome-frontend-skills": {
	id: "awesome-frontend-skills";
  collection: "skills";
  data: any
};
"bang-wo-hui-skill": {
	id: "bang-wo-hui-skill";
  collection: "skills";
  data: any
};
"bang-wo-jiancha-skill": {
	id: "bang-wo-jiancha-skill";
  collection: "skills";
  data: any
};
"baoyu-skills": {
	id: "baoyu-skills";
  collection: "skills";
  data: any
};
"batman-skill": {
	id: "batman-skill";
  collection: "skills";
  data: any
};
"bazi-persona-skill": {
	id: "bazi-persona-skill";
  collection: "skills";
  data: any
};
"bazi-skill": {
	id: "bazi-skill";
  collection: "skills";
  data: any
};
"beijing-chaojia-skill": {
	id: "beijing-chaojia-skill";
  collection: "skills";
  data: any
};
"bggg-taotie-skill": {
	id: "bggg-taotie-skill";
  collection: "skills";
  data: any
};
"blogger-distiller": {
	id: "blogger-distiller";
  collection: "skills";
  data: any
};
"boss-skill": {
	id: "boss-skill";
  collection: "skills";
  data: any
};
"boss-skills": {
	id: "boss-skills";
  collection: "skills";
  data: any
};
"brother-skill": {
	id: "brother-skill";
  collection: "skills";
  data: any
};
"buffett-skill": {
	id: "buffett-skill";
  collection: "skills";
  data: any
};
"build123d-skill": {
	id: "build123d-skill";
  collection: "skills";
  data: any
};
"canding-teacher-skill": {
	id: "canding-teacher-skill";
  collection: "skills";
  data: any
};
"cangjie-skill": {
	id: "cangjie-skill";
  collection: "skills";
  data: any
};
"changshu-anuo-skill": {
	id: "changshu-anuo-skill";
  collection: "skills";
  data: any
};
"character-skills": {
	id: "character-skills";
  collection: "skills";
  data: any
};
"chat-skills": {
	id: "chat-skills";
  collection: "skills";
  data: any
};
"chat-with-me-skill": {
	id: "chat-with-me-skill";
  collection: "skills";
  data: any
};
"chen-xiaoqun-skill": {
	id: "chen-xiaoqun-skill";
  collection: "skills";
  data: any
};
"childhood-skills": {
	id: "childhood-skills";
  collection: "skills";
  data: any
};
"claude-code-skills-zh": {
	id: "claude-code-skills-zh";
  collection: "skills";
  data: any
};
"clonemate": {
	id: "clonemate";
  collection: "skills";
  data: any
};
"cloudflare-skills": {
	id: "cloudflare-skills";
  collection: "skills";
  data: any
};
"cognitive-dividend-skill": {
	id: "cognitive-dividend-skill";
  collection: "skills";
  data: any
};
"comfort-kin": {
	id: "comfort-kin";
  collection: "skills";
  data: any
};
"confucius-skill": {
	id: "confucius-skill";
  collection: "skills";
  data: any
};
"contagious-skill": {
	id: "contagious-skill";
  collection: "skills";
  data: any
};
"copywriters-handbook-skill": {
	id: "copywriters-handbook-skill";
  collection: "skills";
  data: any
};
"crazy-yang-skill": {
	id: "crazy-yang-skill";
  collection: "skills";
  data: any
};
"create-cybermen": {
	id: "create-cybermen";
  collection: "skills";
  data: any
};
"create-loved-one": {
	id: "create-loved-one";
  collection: "skills";
  data: any
};
"crush-skill": {
	id: "crush-skill";
  collection: "skills";
  data: any
};
"cui-hua-skill": {
	id: "cui-hua-skill";
  collection: "skills";
  data: any
};
"cupid-skill": {
	id: "cupid-skill";
  collection: "skills";
  data: any
};
"curator-skill": {
	id: "curator-skill";
  collection: "skills";
  data: any
};
"current-partner-skill": {
	id: "current-partner-skill";
  collection: "skills";
  data: any
};
"cyber-figures": {
	id: "cyber-figures";
  collection: "skills";
  data: any
};
"cyberdoc-skill": {
	id: "cyberdoc-skill";
  collection: "skills";
  data: any
};
"da-zengzi-skill": {
	id: "da-zengzi-skill";
  collection: "skills";
  data: any
};
"dark-forest-skills": {
	id: "dark-forest-skills";
  collection: "skills";
  data: any
};
"darwin-skill": {
	id: "darwin-skill";
  collection: "skills";
  data: any
};
"dave-cowden-skill": {
	id: "dave-cowden-skill";
  collection: "skills";
  data: any
};
"deepseek-yourself-skill": {
	id: "deepseek-yourself-skill";
  collection: "skills";
  data: any
};
"department-skill": {
	id: "department-skill";
  collection: "skills";
  data: any
};
"diamond-sutra-skill": {
	id: "diamond-sutra-skill";
  collection: "skills";
  data: any
};
"digital-life": {
	id: "digital-life";
  collection: "skills";
  data: any
};
"ding-yuanying-skill": {
	id: "ding-yuanying-skill";
  collection: "skills";
  data: any
};
"distilled-persona-hall": {
	id: "distilled-persona-hall";
  collection: "skills";
  data: any
};
"dobby-skill": {
	id: "dobby-skill";
  collection: "skills";
  data: any
};
"dot-skill": {
	id: "dot-skill";
  collection: "skills";
  data: any
};
"duan-yongping-skill": {
	id: "duan-yongping-skill";
  collection: "skills";
  data: any
};
"duan-yongping-toolkit": {
	id: "duan-yongping-toolkit";
  collection: "skills";
  data: any
};
"elastic-agent-skills": {
	id: "elastic-agent-skills";
  collection: "skills";
  data: any
};
"elon-musk-skill": {
	id: "elon-musk-skill";
  collection: "skills";
  data: any
};
"eric-chen-skill": {
	id: "eric-chen-skill";
  collection: "skills";
  data: any
};
"ex-skill": {
	id: "ex-skill";
  collection: "skills";
  data: any
};
"ex-skill-rag": {
	id: "ex-skill-rag";
  collection: "skills";
  data: any
};
"ex-skill-xiaomanchu": {
	id: "ex-skill-xiaomanchu";
  collection: "skills";
  data: any
};
"fangyuan-skill": {
	id: "fangyuan-skill";
  collection: "skills";
  data: any
};
"fe-skills": {
	id: "fe-skills";
  collection: "skills";
  data: any
};
"fengge-skill": {
	id: "fengge-skill";
  collection: "skills";
  data: any
};
"fengge-wangmingtianya": {
	id: "fengge-wangmingtianya";
  collection: "skills";
  data: any
};
"fengshui-skill": {
	id: "fengshui-skill";
  collection: "skills";
  data: any
};
"feynman-skill": {
	id: "feynman-skill";
  collection: "skills";
  data: any
};
"firefly-skill": {
	id: "firefly-skill";
  collection: "skills";
  data: any
};
"first-love-skill": {
	id: "first-love-skill";
  collection: "skills";
  data: any
};
"five-wealth-skill": {
	id: "five-wealth-skill";
  collection: "skills";
  data: any
};
"flash-skill": {
	id: "flash-skill";
  collection: "skills";
  data: any
};
"forge-skill": {
	id: "forge-skill";
  collection: "skills";
  data: any
};
"friend-skill": {
	id: "friend-skill";
  collection: "skills";
  data: any
};
"frontend-architect-chen": {
	id: "frontend-architect-chen";
  collection: "skills";
  data: any
};
"gooaye-skill": {
	id: "gooaye-skill";
  collection: "skills";
  data: any
};
"gotama-buddha-perspective": {
	id: "gotama-buddha-perspective";
  collection: "skills";
  data: any
};
"gsap-skills": {
	id: "gsap-skills";
  collection: "skills";
  data: any
};
"guodegang-skill": {
	id: "guodegang-skill";
  collection: "skills";
  data: any
};
"hepha-skill": {
	id: "hepha-skill";
  collection: "skills";
  data: any
};
"her-skill": {
	id: "her-skill";
  collection: "skills";
  data: any
};
"herself-skill": {
	id: "herself-skill";
  collection: "skills";
  data: any
};
"homelander-skill": {
	id: "homelander-skill";
  collection: "skills";
  data: any
};
"hr-skill": {
	id: "hr-skill";
  collection: "skills";
  data: any
};
"hr-xiao-li": {
	id: "hr-xiao-li";
  collection: "skills";
  data: any
};
"hu-chen-feng": {
	id: "hu-chen-feng";
  collection: "skills";
  data: any
};
"hu-chenfeng-skill": {
	id: "hu-chenfeng-skill";
  collection: "skills";
  data: any
};
"huangdi-neijing-skill": {
	id: "huangdi-neijing-skill";
  collection: "skills";
  data: any
};
"idol-skill": {
	id: "idol-skill";
  collection: "skills";
  data: any
};
"ielts-examiner-skill": {
	id: "ielts-examiner-skill";
  collection: "skills";
  data: any
};
"ilya-skill": {
	id: "ilya-skill";
  collection: "skills";
  data: any
};
"immortal-skill": {
	id: "immortal-skill";
  collection: "skills";
  data: any
};
"influence-skill": {
	id: "influence-skill";
  collection: "skills";
  data: any
};
"interviewer-skill": {
	id: "interviewer-skill";
  collection: "skills";
  data: any
};
"irreplaceable-you": {
	id: "irreplaceable-you";
  collection: "skills";
  data: any
};
"jesus-christ-perspective": {
	id: "jesus-christ-perspective";
  collection: "skills";
  data: any
};
"jiang-nan-skill": {
	id: "jiang-nan-skill";
  collection: "skills";
  data: any
};
"karlmarx-skill": {
	id: "karlmarx-skill";
  collection: "skills";
  data: any
};
"karpathy-skill": {
	id: "karpathy-skill";
  collection: "skills";
  data: any
};
"khazix-skills": {
	id: "khazix-skills";
  collection: "skills";
  data: any
};
"lambdatest-agent-skills": {
	id: "lambdatest-agent-skills";
  collection: "skills";
  data: any
};
"langjie-project": {
	id: "langjie-project";
  collection: "skills";
  data: any
};
"lenin-skill": {
	id: "lenin-skill";
  collection: "skills";
  data: any
};
"li-daxiao-skill": {
	id: "li-daxiao-skill";
  collection: "skills";
  data: any
};
"liangxi-skills": {
	id: "liangxi-skills";
  collection: "skills";
  data: any
};
"linus-torvalds-skill": {
	id: "linus-torvalds-skill";
  collection: "skills";
  data: any
};
"linxue-skill": {
	id: "linxue-skill";
  collection: "skills";
  data: any
};
"liuyishou-skill": {
	id: "liuyishou-skill";
  collection: "skills";
  data: any
};
"love-skill": {
	id: "love-skill";
  collection: "skills";
  data: any
};
"luo-xiang": {
	id: "luo-xiang";
  collection: "skills";
  data: any
};
"luxun-skill": {
	id: "luxun-skill";
  collection: "skills";
  data: any
};
"maintainer-skill": {
	id: "maintainer-skill";
  collection: "skills";
  data: any
};
"mama-skill": {
	id: "mama-skill";
  collection: "skills";
  data: any
};
"mao-perspective": {
	id: "mao-perspective";
  collection: "skills";
  data: any
};
"maoxuan-skill": {
	id: "maoxuan-skill";
  collection: "skills";
  data: any
};
"master-skill": {
	id: "master-skill";
  collection: "skills";
  data: any
};
"maugham-skill": {
	id: "maugham-skill";
  collection: "skills";
  data: any
};
"mentor-skill-sonic": {
	id: "mentor-skill-sonic";
  collection: "skills";
  data: any
};
"merchant-skill-generator": {
	id: "merchant-skill-generator";
  collection: "skills";
  data: any
};
"midas-skill": {
	id: "midas-skill";
  collection: "skills";
  data: any
};
"mind-distiller": {
	id: "mind-distiller";
  collection: "skills";
  data: any
};
"mises-perspective": {
	id: "mises-perspective";
  collection: "skills";
  data: any
};
"mocha-skill": {
	id: "mocha-skill";
  collection: "skills";
  data: any
};
"mrbeast-skill": {
	id: "mrbeast-skill";
  collection: "skills";
  data: any
};
"munger-skill": {
	id: "munger-skill";
  collection: "skills";
  data: any
};
"my-digital-life": {
	id: "my-digital-life";
  collection: "skills";
  data: any
};
"naval-skill": {
	id: "naval-skill";
  collection: "skills";
  data: any
};
"neon-agent-skills": {
	id: "neon-agent-skills";
  collection: "skills";
  data: any
};
"ni-haixia-skill": {
	id: "ni-haixia-skill";
  collection: "skills";
  data: any
};
"numerologist-skills": {
	id: "numerologist-skills";
  collection: "skills";
  data: any
};
"nuwa-distilled-skills": {
	id: "nuwa-distilled-skills";
  collection: "skills";
  data: any
};
"nuwa-skill": {
	id: "nuwa-skill";
  collection: "skills";
  data: any
};
"nuwa-skills": {
	id: "nuwa-skills";
  collection: "skills";
  data: any
};
"open-demon-ex-skills": {
	id: "open-demon-ex-skills";
  collection: "skills";
  data: any
};
"openai-skills": {
	id: "openai-skills";
  collection: "skills";
  data: any
};
"openclaw-retail-trader": {
	id: "openclaw-retail-trader";
  collection: "skills";
  data: any
};
"palind-skill": {
	id: "palind-skill";
  collection: "skills";
  data: any
};
"parents-skill": {
	id: "parents-skill";
  collection: "skills";
  data: any
};
"partner-skill": {
	id: "partner-skill";
  collection: "skills";
  data: any
};
"paul-graham-skill": {
	id: "paul-graham-skill";
  collection: "skills";
  data: any
};
"penetration-team": {
	id: "penetration-team";
  collection: "skills";
  data: any
};
"perkfly-ex-skill": {
	id: "perkfly-ex-skill";
  collection: "skills";
  data: any
};
"persona-compass": {
	id: "persona-compass";
  collection: "skills";
  data: any
};
"pig-skill": {
	id: "pig-skill";
  collection: "skills";
  data: any
};
"pixijs-skills": {
	id: "pixijs-skills";
  collection: "skills";
  data: any
};
"professor-skill": {
	id: "professor-skill";
  collection: "skills";
  data: any
};
"psychclaw-skill": {
	id: "psychclaw-skill";
  collection: "skills";
  data: any
};
"qiushi-skill": {
	id: "qiushi-skill";
  collection: "skills";
  data: any
};
"relationship-training-skill": {
	id: "relationship-training-skill";
  collection: "skills";
  data: any
};
"relic-skill": {
	id: "relic-skill";
  collection: "skills";
  data: any
};
"retail-investors-skill": {
	id: "retail-investors-skill";
  collection: "skills";
  data: any
};
"reunion-skill": {
	id: "reunion-skill";
  collection: "skills";
  data: any
};
"roast-cold-email-skill": {
	id: "roast-cold-email-skill";
  collection: "skills";
  data: any
};
"rob-pike-skill": {
	id: "rob-pike-skill";
  collection: "skills";
  data: any
};
"saul-goodman-skill": {
	id: "saul-goodman-skill";
  collection: "skills";
  data: any
};
"sbti-persona-test-skill": {
	id: "sbti-persona-test-skill";
  collection: "skills";
  data: any
};
"sbti-skill": {
	id: "sbti-skill";
  collection: "skills";
  data: any
};
"security-engineer-wang": {
	id: "security-engineer-wang";
  collection: "skills";
  data: any
};
"self-skill-lipg": {
	id: "self-skill-lipg";
  collection: "skills";
  data: any
};
"senpai-skill": {
	id: "senpai-skill";
  collection: "skills";
  data: any
};
"shopitrust": {
	id: "shopitrust";
  collection: "skills";
  data: any
};
"shuixian-skill": {
	id: "shuixian-skill";
  collection: "skills";
  data: any
};
"simp-skill": {
	id: "simp-skill";
  collection: "skills";
  data: any
};
"skill-everyone": {
	id: "skill-everyone";
  collection: "skills";
  data: any
};
"skills-distill": {
	id: "skills-distill";
  collection: "skills";
  data: any
};
"skills-supply": {
	id: "skills-supply";
  collection: "skills";
  data: any
};
"star-skill": {
	id: "star-skill";
  collection: "skills";
  data: any
};
"steamer-skill": {
	id: "steamer-skill";
  collection: "skills";
  data: any
};
"steve-jobs-skill": {
	id: "steve-jobs-skill";
  collection: "skills";
  data: any
};
"stormzhang-skills": {
	id: "stormzhang-skills";
  collection: "skills";
  data: any
};
"sun-yuchen-perspective": {
	id: "sun-yuchen-perspective";
  collection: "skills";
  data: any
};
"sunday-skill": {
	id: "sunday-skill";
  collection: "skills";
  data: any
};
"supabase-agent-skills": {
	id: "supabase-agent-skills";
  collection: "skills";
  data: any
};
"superman-skill": {
	id: "superman-skill";
  collection: "skills";
  data: any
};
"supervisor-skill": {
	id: "supervisor-skill";
  collection: "skills";
  data: any
};
"supervisor-skill-universe": {
	id: "supervisor-skill-universe";
  collection: "skills";
  data: any
};
"taleb-skill": {
	id: "taleb-skill";
  collection: "skills";
  data: any
};
"tech-distiller": {
	id: "tech-distiller";
  collection: "skills";
  data: any
};
"tiangou-skill": {
	id: "tiangou-skill";
  collection: "skills";
  data: any
};
"tim-cook-skill": {
	id: "tim-cook-skill";
  collection: "skills";
  data: any
};
"tomsawyerhu-persona-skill": {
	id: "tomsawyerhu-persona-skill";
  collection: "skills";
  data: any
};
"tong-jincheng-skill": {
	id: "tong-jincheng-skill";
  collection: "skills";
  data: any
};
"toprank-contentwriter": {
	id: "toprank-contentwriter";
  collection: "skills";
  data: any
};
"trailofbits-skills": {
	id: "trailofbits-skills";
  collection: "skills";
  data: any
};
"translator-skill": {
	id: "translator-skill";
  collection: "skills";
  data: any
};
"true-fans-skill": {
	id: "true-fans-skill";
  collection: "skills";
  data: any
};
"trump-skill": {
	id: "trump-skill";
  collection: "skills";
  data: any
};
"undergrad-anti-distill-skill": {
	id: "undergrad-anti-distill-skill";
  collection: "skills";
  data: any
};
"vengeful-ghost-skill": {
	id: "vengeful-ghost-skill";
  collection: "skills";
  data: any
};
"vercel-agent-skills": {
	id: "vercel-agent-skills";
  collection: "skills";
  data: any
};
"vercel-skills": {
	id: "vercel-skills";
  collection: "skills";
  data: any
};
"vibeportrait": {
	id: "vibeportrait";
  collection: "skills";
  data: any
};
"viral-copywriting-skill": {
	id: "viral-copywriting-skill";
  collection: "skills";
  data: any
};
"waifu-skill": {
	id: "waifu-skill";
  collection: "skills";
  data: any
};
"wang-baoqiang-skill": {
	id: "wang-baoqiang-skill";
  collection: "skills";
  data: any
};
"wang-xiaobo-skill": {
	id: "wang-xiaobo-skill";
  collection: "skills";
  data: any
};
"wangyangming-skill": {
	id: "wangyangming-skill";
  collection: "skills";
  data: any
};
"warm-handover": {
	id: "warm-handover";
  collection: "skills";
  data: any
};
"weirdo-tv-skill": {
	id: "weirdo-tv-skill";
  collection: "skills";
  data: any
};
"weizou-skill": {
	id: "weizou-skill";
  collection: "skills";
  data: any
};
"writer-skill": {
	id: "writer-skill";
  collection: "skills";
  data: any
};
"wshobson-agents": {
	id: "wshobson-agents";
  collection: "skills";
  data: any
};
"wudao-hero-skill": {
	id: "wudao-hero-skill";
  collection: "skills";
  data: any
};
"x-mentor-skill": {
	id: "x-mentor-skill";
  collection: "skills";
  data: any
};
"xiangnong-clark-skill": {
	id: "xiangnong-clark-skill";
  collection: "skills";
  data: any
};
"xiaomasong-perspective": {
	id: "xiaomasong-perspective";
  collection: "skills";
  data: any
};
"xinqingnian-skill": {
	id: "xinqingnian-skill";
  collection: "skills";
  data: any
};
"xinzhiyuan-skill": {
	id: "xinzhiyuan-skill";
  collection: "skills";
  data: any
};
"xu-quanren-skill": {
	id: "xu-quanren-skill";
  collection: "skills";
  data: any
};
"yinyuan-skills": {
	id: "yinyuan-skills";
  collection: "skills";
  data: any
};
"yourself-skill": {
	id: "yourself-skill";
  collection: "skills";
  data: any
};
"yuntianming-skill": {
	id: "yuntianming-skill";
  collection: "skills";
  data: any
};
"yutinghao-skill": {
	id: "yutinghao-skill";
  collection: "skills";
  data: any
};
"zaomeng-skill": {
	id: "zaomeng-skill";
  collection: "skills";
  data: any
};
"zeng-guofan-skill": {
	id: "zeng-guofan-skill";
  collection: "skills";
  data: any
};
"zhang-ruofan-skill": {
	id: "zhang-ruofan-skill";
  collection: "skills";
  data: any
};
"zhang-yiming-skill": {
	id: "zhang-yiming-skill";
  collection: "skills";
  data: any
};
"zhangxuefeng-skill": {
	id: "zhangxuefeng-skill";
  collection: "skills";
  data: any
};
"zhihu-valhalla": {
	id: "zhihu-valhalla";
  collection: "skills";
  data: any
};
"zhong-zhi-wo-skill": {
	id: "zhong-zhi-wo-skill";
  collection: "skills";
  data: any
};
"zhou-jintao-skill": {
	id: "zhou-jintao-skill";
  collection: "skills";
  data: any
};
"zhrq-professor-skill": {
	id: "zhrq-professor-skill";
  collection: "skills";
  data: any
};
"zhuzi-skill": {
	id: "zhuzi-skill";
  collection: "skills";
  data: any
};
"ziji-skills": {
	id: "ziji-skills";
  collection: "skills";
  data: any
};
"zizek-skill": {
	id: "zizek-skill";
  collection: "skills";
  data: any
};
"zuotiqu-skill": {
	id: "zuotiqu-skill";
  collection: "skills";
  data: any
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}
