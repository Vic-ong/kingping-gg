<template>
  <div>
    <v-card class="panel-container elevation-5" style="margin-top: 48px;">
      <div class="panel-header">
        <div class="title-font panel-title-container secondary elevation-5">Wagers</div>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="fa-search"
          label="Search"
          style="max-width: 400px;"
          single-line
          hide-details
        ></v-text-field>
      </div>
      <div class="panel-header">
        <div class="filters">
          <div class="title-font">Outcome Filters:</div>
          <div
            class="filter-chip elevation-3"
            style="cursor: pointer;"
            :style="`background-color: ${outcome.active ? 'lightgray' : 'transparent'};`"
            v-for="(outcome, i) in filterSelections.outcome"
            v-bind:key="outcome.value"
            @click="selectFilter(outcome.value, 'outcome', i)"
          >
            {{ outcome.text }}
          </div>
        </div>
        <div class="filters">
          <div class="title-font">Status Filters:</div>
          <div
            class="filter-chip elevation-3"
            style="cursor: pointer;"
            :style="`background-color: ${status.active ? 'lightgray' : 'transparent'};`"
            v-for="(status, i) in filterSelections.status"
            v-bind:key="status.value"
            @click="selectFilter(status.value, 'status', i)"
          >
            {{ status.text }}
          </div>
        </div>
      </div>
      <v-data-table class="data-table" :options="tableOpts" :headers="headers" :items="dataFiltered" :search="search">
        <template v-slot:body="{ items }">
          <tbody>
            <tr v-for="d in items" :key="d._id">
              <td v-for="header in headers" v-bind:key="header.value" style="text-align: left;">
                <div v-if="header.editable" style="cursor: pointer;" @click="onEditClick(d)">
                  {{ d[header.value] }}
                </div>
                <div v-else>{{ d[header.value] }}</div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="400">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="popup-container">
          <div class="title-font popup-title">Edit User</div>
          <v-select v-model="editObject.status" :items="filterSelections.status" label="Status" required />
          <v-select v-model="editObject.outcome" :items="filterSelections.outcome" label="Outcome" required />
          <div v-bind:class="[status.classStyle]">{{ status.message }}</div>
          <v-btn :loading="loading" @click="onConfirmEdit" color="secondary" class="main-btn popup-btn" tile large>
            Confirm
          </v-btn>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import format from 'date-fns/format';
import { Vue, Component, Prop, Ref } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Wager } from '@/store/wager/types';

const wager = namespace('wager');

type VForm = Vue & { validate: () => boolean };

interface EditObject {
  _id: string;
  status: string;
  outcome: string;
}

interface UpdateProps {
  id: string;
  status: string;
  outcome: string;
  updatedAt: Date;
}

interface FilterSelectionProps {
  text: string;
  value: string;
  active: boolean;
}

interface FilterSelectionsProps {
  outcome: FilterSelectionProps[];
  status: FilterSelectionProps[];
  [key: string]: FilterSelectionProps[];
}

interface FiltersProps {
  outcome: string[];
  status: string[];
  [key: string]: string[];
}

@Component({
  name: 'WagerListPanel',
})
export default class WagerListPanel extends Vue {
  @Ref('form') readonly form!: VForm;
  @Prop() data!: Wager;

  @wager.Action
  public updateWagerList!: (param: UpdateProps) => void;

  private tableOpts = {
    itemsPerPage: 10,
    sortBy: ['updatedAt'],
    sortDesc: [true],
    mustSort: true,
  };
  private headers = [
    {
      text: 'ID',
      value: '_id',
    },
    {
      text: 'Wager name',
      value: 'name',
    },
    {
      text: 'User',
      value: 'userName',
    },
    {
      text: 'Amount',
      value: 'amount',
    },
    {
      text: 'Payout',
      value: 'payout',
    },
    {
      text: 'Game mode',
      value: 'mode',
    },
    {
      text: 'Status',
      value: 'status',
      editable: true,
    },
    {
      text: 'Outcome',
      value: 'outcome',
      editable: true,
    },
    {
      text: 'Created On',
      value: 'createdAt',
    },
    {
      text: 'Last Updated',
      value: 'updatedAt',
    },
  ];
  private filterSelections: FilterSelectionsProps = {
    outcome: [
      { text: 'Won', value: 'won', active: true },
      { text: 'Lost', value: 'lost', active: true },
      { text: 'Pending', value: 'pending', active: false },
      { text: 'Invalid', value: 'invalid', active: false },
    ],
    status: [
      { text: 'Resolved', value: 'resolved', active: true },
      { text: 'No matches', value: 'no_matches_found', active: false },
      { text: 'User concede defeat', value: 'user_concede_defeat', active: false },
    ],
  };
  private filters: FiltersProps = {
    outcome: ['won', 'lost'],
    status: ['resolved'],
  };
  private search = '';
  private valid = true;
  private loading = false;
  private editDialog = false;
  private editObject: EditObject = {
    _id: '',
    status: '',
    outcome: '',
  };
  private status = {
    classStyle: '',
    message: '',
  };
  private rules = {
    required: (v: string) => !!v || 'This field is required',
    isCurrency: (v: string) => this.isValidCurrency(v) || 'Invalid currency',
  };

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  public formatTimestamp(dt: any) {
    return format(new Date(dt.seconds * 1000), 'MM/dd HH:mm');
  }

  public isValidCurrency(v: string) {
    if (Number.isNaN(Number(v))) return false;
    if (Number(v) === 0) return true;
    const regex = /^[1-9]\d*(?:\.\d{0,2})?$/;
    return regex.test(v);
  }

  get tableData() {
    if (this.data instanceof Array) {
      return this.data.map((d: Wager) => ({
        _id: d._id,
        name: d.bettingOdds.name,
        userName: `${d.user.firstName} ${d.user.lastName}`,
        amount: d.amount,
        payout: d.payout,
        mode: d.mode,
        status: d.status,
        outcome: d.outcome,
        createdAt: this.formatTimestamp(d.createdAt),
        updatedAt: this.formatTimestamp(d.updatedAt),
      }));
    }
    return [];
  }

  get dataFiltered() {
    if (this.filters.outcome.length === 0 && this.filters.status.length === 0) {
      return this.tableData;
    }
    return this.tableData.filter((d) => {
      let outcomeMatch = true;
      if (this.filters.outcome.length > 0) {
        outcomeMatch = this.filters.outcome.some((f) => d.outcome === f);
      }
      let statusMatch = true;
      if (this.filters.status.length > 0) {
        statusMatch = this.filters.status.some((f) => d.status === f);
      }
      return outcomeMatch && statusMatch;
    });
  }

  public selectFilter(filter: string, type: string, selIndex: number) {
    const selection = this.filterSelections[type][selIndex];
    const filters = this.filters[type];
    if (selection.active) {
      const index = filters.findIndex((el) => el === filter);
      filters.splice(index, 1);
    } else {
      filters.push(filter);
    }

    selection.active = !selection.active;
  }

  public onEditClick(obj: EditObject) {
    this.editDialog = true;
    this.editObject = { ...obj };
  }

  public async onConfirmEdit() {
    this.valid = this.form ? this.form.validate() : false;
    if (this.valid) {
      try {
        this.loading = true;
        this.status = {
          classStyle: 'info--text',
          message: 'Updating information',
        };
        await this.updateWagerList({
          id: this.editObject._id,
          status: this.editObject.status,
          outcome: this.editObject.outcome,
          updatedAt: new Date(),
        });
        this.status = {
          classStyle: '',
          message: '',
        };
        this.editDialog = false;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        console.error(err);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-container {
  border-radius: 4px !important;
  margin-top: 12px;

  .panel-header {
    display: flex;
    position: relative;
    padding: 0 24px 24px 24px;

    .panel-title-container {
      position: absolute;
      left: 48px;
      top: -24px;
      min-width: 120px;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 18px;
      color: white;
    }
  }
}

.data-table {
  overflow-x: scroll;
}

.filters {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  :not(:last-child) {
    margin-right: 12px;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    height: 30px;
    min-width: 70px;
    border-radius: 15px;
    font-size: 12px;
  }
}

.popup-container {
  padding: 36px 24px 24px 24px;

  .popup-title {
    font-size: 24px;
    padding-bottom: 12px;
  }
}
</style>
