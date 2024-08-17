<template>
	<div>
		<div v-if="loading" class="loader"> <span>{{ $t('components.admin.patrons.loading') }}</span></div>

		<h1 class="d-flex justify-content-between">
			{{ patron.full_name }}
			<span>
				<a v-if="!edit" @click="setEdit(true)" class="mx-2">
					<i aria-hidden="true" class="fas fa-pencil-alt"></i>
					<q-tooltip anchor="top middle" self="center middle">
						{{ $t('edit_capitalized') }}
					</q-tooltip>
				</a>
				<a v-else @click="setEdit(false)" class="mx-2">
					<i aria-hidden="true" class="fas fa-times"></i>
					<q-tooltip anchor="top middle" self="center middle">
						{{ $t('cancel_capitalized') }}
					</q-tooltip>
				</a>
			</span>
		</h1>
		<p><i aria-hidden="true" class="neutral-2">{{ patron['.key'] }}</i></p>

		<template v-if="!edit">
			<div class="row q-col-gutter-md mb-2">
				<div class="col-2">
					{{ $t('email_capitalized') }}
				</div>
				<div class="col">
					{{ patron.email }}
				</div>
			</div>
		
			<div class="row q-col-gutter-md mb-2">
				<div class="col-2">
					{{ $t('tier_plural_capitalized') }}
				</div>
				<div class="col">
					<span 
						v-for="(tier, key) in patron.tiers" 
						:key="key"
						class="tiers"
						:class="{
							'blue': tiers[key].name == 'Folk Hero',
							'purple': tiers[key].name == 'Noble',
							'orange': tiers[key].name == 'Deity'
						}">{{ tiers[key].name }}</span>
				</div>
			</div>

			<div class="row q-col-gutter-md mb-2">
				<div class="col-2">
					{{ $t('components.admin.patrons.last_charge_capitalized') }}
				</div>
				<div class="col">
					<span :class="{ 'red': patron.last_charge_status == 'Declined', 'green': patron.last_charge_status == 'Paid' }">{{ patron.last_charge_status }}</span>
					<span class="neutral-2"> ({{ makeDate(patron.last_charge_date) }})</span>
				</div>
			</div>

			<div class="row q-col-gutter-md mb-2">
				<div class="col-2">
					{{ $t('components.admin.patrons.lifetime_capitalized') }}
				</div>
				<div class="col">
					{{ patron.lifetime_support  / 100 | numeral('$0,0') }}
				</div>
			</div>

			<div class="row q-col-gutter-md mb-2">
				<div class="col-2">
					{{ $t('components.admin.patrons.pledge_start_capitalized') }}
				</div>
				<div class="col">
					{{ makeDate(patron.pledge_start) }}
				</div>
			</div>

			<div class="row q-col-gutter-md mb-2">
				<div class="col-2">
					{{ $t('components.admin.patrons.pledge_end_capitalized') }}
				</div>
				<div class="col">
					{{ makeDate(patron.pledge_end) }}
				</div>
			</div>

			<a target="_blank" rel="noopener" :href="'https://www.patreon.com/user/creators?u='+patron['.key']">{{ $t('components.admin.patrons.show_on_patreon') }}</a>
		</template>
		<EditPatron v-else :editPatron="patron" />
	</div>
</template>

<script>
	import { db } from 'src/firebase'
	import { general } from 'src/mixins/general.js'
	import EditPatron from 'src/views/Admin/Patrons/New.vue'

	export default {
		name: 'Patron',
		components: {
			EditPatron
		},
		mixins: [general],
		props: ['id'],
		data() {
			return {
				loading: true,
				edit: false
			}
		},
		firebase() {
			return {
				patron: {
					source: db.ref(`new_patrons/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				tiers: {
					source: db.ref(`tiers`),
					asObject: true
				}
			}
		},
		methods: {
			setEdit(value) {
				this.edit = value
			}
		}
	}
</script>

<style lang="scss" scoped>
	h1, h2 {
		margin-bottom: 5px !important;
	}
	.data {
		line-height: 25px;

		.type {
			display: inline-block;
			width: 150px;
		}
	}
	.tiers {
		&::after {
			content: ', ';
			color: $neutral-1;
		}
		&:last-child::after {
			content: '';
		}
	}
</style>