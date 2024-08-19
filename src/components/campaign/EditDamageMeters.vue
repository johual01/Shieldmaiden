<template>
	<div v-if="!loading">
		<h2 class="d-flex justify-content-between items-center">
			{{ $t('damage_meters') }}
			<button class="btn bg-red mb-2" @click="reset">
				{{ $t('reset_all') }}
				<i class="fas fa-undo ml-1" aria-hidden="true" />
			</button>
		</h2>
		<p>{{ $t('modify_value') }}</p>

		<q-toggle v-model="over" label="Over damage/healing" />
		<q-tabs v-model="current_tab" outside-arrows>
			<q-tab v-for="{ value: tab, label } in tabs" :key="tab" :name="tab" :label="label" />
		</q-tabs>
		<q-tab-panels v-model="current_tab" class="bg-transparent" :key="over">
			<q-tab-panel v-for="{ type: tab, label } in tabs" :key="`panel-${tab}`" :name="tab">
				<template v-for="{type, label: typeLabel } in over ? over_types : types">
					<h3 :key="`header-${type}`">
						<i class="mr-1 fas" :class="icon(type)" aria-hidden="true" />
						{{ typeLabel.capitalize() }} {{ label.toLowerCase() }}
					</h3>
					<ul class="meters" :key="`list-${type}`">
						<li
							v-for="(player, i) in meters(`${type}${tab === 'Taken' ? tab : ''}`)"
							class="meters__player"
							:key="`li-${type}-${i}`"
						>
							<div
								class="meters__player-avatar"
								:style="{
									backgroundImage: player.avatar ? 'url(\'' + player.avatar + '\')' : '',
								}"
							>
								<i v-if="!player.avatar" class="hki-player" aria-hidden="true" />
							</div>
							<div class="meters__player-name">{{ player.name }}</div>
							<div class="meters__player-value">
								<button class="btn btn-sm bg-neutral-5">
									<hk-animated-integer :value="player.value" />
									<q-popup-edit
										v-model.number="player.value"
										:dark="$store.getters.theme === 'dark'"
										auto-save
									>
										<q-input
											:dark="$store.getters.theme === 'dark'"
											type="number"
											:value="player.value"
											dense
											autofocus
											@focus="$event.target.select()"
											@keyup.enter="setValue($event, player.key, type, tab)"
										/>
									</q-popup-edit>
								</button>
							</div>
						</li>
					</ul>
				</template>
			</q-tab-panel>
		</q-tab-panels>
		<small v-if="over">
			<strong>{{ $t('overkill_capitalized') }}</strong> {{ $t('overkill_description') }}<br />
			<strong>{{ $t('overhealing_capitalized') }}</strong> {{ $t('overhealing_description') }}
		</small>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import _ from "lodash";

export default {
	name: "EditDamageMeters",
	data() {
		return {
			user: this.$store.getters.user,
			over: false,
			campaignId: this.$route.params.campid,
			loading: true,
			campaign: {},
			players: {},
			current_tab: "Done",
			tabs: [
				{
					type: "Done",
					label: this.$t("done_capitalized"),
				}, 
				{
					type: "Taken",
					label: this.$t("taken_capitalized"),
				}
			],
			types: [
				{
					type: "damage",
					label: this.$t("damage"),
				}, 
				{
					type: "healing",
					label: this.$t("healing"),
				}
			],
			over_types: [
				{
					type: "overkill",
					label: this.$t("overkill"),
				}, 
				{
					type: "overhealing",
					label: this.$t("overhealing"),
				}
			],
		};
	},
	computed: {},
	async mounted() {
		this.campaign = await this.get_campaign({
			uid: this.user.uid,
			id: this.campaignId,
		});
		for (const id in this.campaign.players) {
			this.players[id] = await this.get_player({ uid: this.user.uid, id });
		}
		this.loading = false;
	},
	methods: {
		...mapActions("campaigns", ["get_campaign", "update_campaign_entity"]),
		...mapActions("players", ["get_player"]),
		meters(type) {
			const players = this.campaign.players
				? Object.entries(this.campaign.players).map(([key, player]) => ({
						key: key,
						avatar: this.players[key].storage_avatar || this.players[key].avatar,
						name: this.players[key].character_name,
						value: player.meters ? player.meters[type] || 0 : 0,
				  }))
				: [];
			return _.orderBy(players, ["value", "name"], ["desc", "asc"]);
		},
		icon(type) {
			switch (type) {
				case "healing":
				case "overhealing":
					return "fa-heart";
				case "overkill":
					return "fa-skull";
				default:
					return "fa-swords";
			}
		},
		async setValue(e, key, type, tab) {
			const value = e.target.value !== "" ? parseInt(e.target.value) : null;
			const prop = tab === "Taken" ? `${type}${tab}` : type;

			const meters = this.campaign.players[key].meters || {};
			this.$set(meters, prop, value ? value.min() : value);

			await this.update_campaign_entity({
				uid: this.user.uid,
				campaignId: this.campaignId,
				type: "players",
				id: key,
				property: "meters",
				value: meters,
			});
		},
		reset() {
			this.$snotify.error(
				"Are you sure? For every player, all values will be set to 0.",
				"Reset meters",
				{
					timeout: false,
					position: "rightTop",
					buttons: [
						{
							text: "Yes",
							action: (toast) => {
								this.resetAll();
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "No",
							action: (toast) => {
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		},
		async resetAll() {
			for (const key in this.campaign.players) {
				await this.update_campaign_entity({
					uid: this.user.uid,
					campaignId: this.campaignId,
					type: "players",
					id: key,
					property: "meters",
					value: null,
				});
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.q-tab-panel {
	padding: 15px 0;
}
.meters {
	list-style: none;
	padding: 0;

	&__player {
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 10px;
		background-color: $neutral-9;
		margin-bottom: 1px;

		&-avatar {
			height: 40px;
			width: 40px;
			background-size: cover;
			background-position: center top;
			border: solid 1px $neutral-4;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28px;
			color: $neutral-2;
			background-color: $neutral-8;
		}
		&-name {
			flex-grow: 1;
		}
		&-value {
			padding: 5px 10px;
		}
	}
}
</style>
