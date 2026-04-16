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
"anti-distill": {
	id: "anti-distill";
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
"batman-skill": {
	id: "batman-skill";
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
"boss-skill": {
	id: "boss-skill";
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
"chat-skills": {
	id: "chat-skills";
  collection: "skills";
  data: any
};
"chen-xiaoqun-skill": {
	id: "chen-xiaoqun-skill";
  collection: "skills";
  data: any
};
"confucius-skill": {
	id: "confucius-skill";
  collection: "skills";
  data: any
};
"crazy-yang-skill": {
	id: "crazy-yang-skill";
  collection: "skills";
  data: any
};
"crush-skill": {
	id: "crush-skill";
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
"dave-cowden-skill": {
	id: "dave-cowden-skill";
  collection: "skills";
  data: any
};
"department-skill": {
	id: "department-skill";
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
"elon-musk-skill": {
	id: "elon-musk-skill";
  collection: "skills";
  data: any
};
"ex-skill": {
	id: "ex-skill";
  collection: "skills";
  data: any
};
"fangyuan-skill": {
	id: "fangyuan-skill";
  collection: "skills";
  data: any
};
"fengge-wangmingtianya": {
	id: "fengge-wangmingtianya";
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
"frontend-architect-chen": {
	id: "frontend-architect-chen";
  collection: "skills";
  data: any
};
"gotama-buddha-perspective": {
	id: "gotama-buddha-perspective";
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
"jesus-christ-perspective": {
	id: "jesus-christ-perspective";
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
"liuyishou-skill": {
	id: "liuyishou-skill";
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
"mama-skill": {
	id: "mama-skill";
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
"naval-skill": {
	id: "naval-skill";
  collection: "skills";
  data: any
};
"numerologist-skills": {
	id: "numerologist-skills";
  collection: "skills";
  data: any
};
"nuwa-skill": {
	id: "nuwa-skill";
  collection: "skills";
  data: any
};
"parents-skill": {
	id: "parents-skill";
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
"security-engineer-wang": {
	id: "security-engineer-wang";
  collection: "skills";
  data: any
};
"senpai-skill": {
	id: "senpai-skill";
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
"star-skill": {
	id: "star-skill";
  collection: "skills";
  data: any
};
"steve-jobs-skill": {
	id: "steve-jobs-skill";
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
"taleb-skill": {
	id: "taleb-skill";
  collection: "skills";
  data: any
};
"tim-cook-skill": {
	id: "tim-cook-skill";
  collection: "skills";
  data: any
};
"tong-jincheng-skill": {
	id: "tong-jincheng-skill";
  collection: "skills";
  data: any
};
"translator-skill": {
	id: "translator-skill";
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
"weizou-skill": {
	id: "weizou-skill";
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
"xinqingnian-skill": {
	id: "xinqingnian-skill";
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
"zhong-zhi-wo-skill": {
	id: "zhong-zhi-wo-skill";
  collection: "skills";
  data: any
};
"zhuzi-skill": {
	id: "zhuzi-skill";
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
