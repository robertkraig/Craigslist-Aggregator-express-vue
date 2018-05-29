<template>
  <div v-if="isConfLoaded">
    <form v-on:submit.prevent="submit" id="find_items">
      <div id="change_size_container">
        <div v-html="getPageTitle" style="font-size: 20px;"></div>
        <div v-for="(field, fIdx) in getFields" :key="fIdx">
          <div v-if="isEq(field.argType, 'text')">
            <label class="fields" :for="field.argId" v-html="field.argTitle"></label>
            <input class="fields" type="text" v-model="form[field.argName]" :id="field.argId"/>
            <br style="margin:0;padding:0; height:1px; clear: left;"/>
          </div>
          <div v-if="isEq(field.argType, 'radio')">
            <div v-for="(radio, rIdx) in field.radios" :key="rIdx">
              <label class="fields" :for="radio.argName_id" v-html="radio.argName"></label>
              <input class="fields" type="radio" v-model="form[field.argName]" :value="radio.arg"
                     :id="radio.argName_id"/>
              <br style="margin:0;padding:0; height:1px; clear: left;"/>
            </div>
          </div>
          <div v-if="isEq(field.argType, 'checkbox')">
            <label class="fields" :for="field.checkbox.argName" v-html="field.checkbox.title"></label>
            <input class="fields" type="checkbox" v-model="form[field.checkbox.argName]" :value="field.checkbox.value"
                   :id="field.checkbox.argName"/>
            <br style="margin:0;padding:0; height:1px; clear: left;"/>
          </div>
        </div>
        <cite v-html="getSearchExample"></cite>
        <div id="locations_container">
          Region:&nbsp;&nbsp;
          <a v-on:click.prevent="toggleRegionList">
            <span v-if="isRegionListOpen">close</span>
            <span v-if="!isRegionListOpen">open</span>
          </a>
          <div :class="{open:isRegionListOpen}" id="region_list">
            <label v-for="region in getRegionList" :for="region.type" :key="region.type">
              <input v-on:click="updateRegionSelection(region)" v-model="region.selected"
                     class="regions" type="checkbox" :id="region.type" :value="region.type"/>{{region.name}}
            </label>
          </div>
          <br/>
          Areas:&nbsp;&nbsp;
          <a v-on:click.prevent="toggleAreaList">
            <span v-if="isAreaListOpen">close</span>
            <span v-if="!isAreaListOpen">open</span>
          </a>
          <div :class="{open:isAreaListOpen}" id="areas_list">
            <label>Selected selected: {{getTotalAreas}}</label>
            <label v-for="area in getSelectedAreas" :for="area.partial" :key="area.partial">
              <input v-on:click="updateAreaSelection(area)" class="region location"
                     :class="{[area.type]:true}" v-model="area.selected" type="checkbox" :id="area.partial"
                     :value="area.partial"/>{{area.name}}, {{area.state}}
            </label>
            <label>Un-Selected</label>
            <label v-for="area in getUnselectedAreas" :for="area.partial" :key="area.partial">
              <input v-on:click="updateAreaSelection(area)" class="region location"
                     :class="{[area.type]:true}" v-model="area.selected" type="checkbox" :id="area.partial"
                     :value="area.partial"/>{{area.name}}, {{area.state}}
            </label>
          </div>
        </div>
        <button id="search_btn" type="submit">Search</button>
      </div>
    </form>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex'

export default {
  props: {
    initFormFields: {
      required: true
    }
  },
  data () {
    return {
      form: this.initFormFields
    }
  },
  methods: {
    ...mapActions([
      'submitSearch'
    ]),
    ...mapMutations([
      'toggleRegionList',
      'toggleAreaList',
      'updateRegionSelection',
      'updateAreaSelection'
    ]),
    isEq (field, val) {
      return field === val
    },
    submit () {
      this.submitSearch({
        form: this.form
      })
    }
  },
  computed: {
    ...mapGetters([
      'isAreaListOpen',
      'isConfLoaded',
      'isRegionListOpen',
      'getSearchData',
      'getPageTitle',
      'getSearchExample',
      'getRegionList',
      'getAreaList',
      'getFields',
      'getSelectedAreas',
      'getUnselectedAreas',
      'getTotalAreas'
    ])
  }
}
</script>
