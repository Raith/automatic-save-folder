﻿/* ***** BEGIN LICENSE BLOCK *****
Automatic Save Folder
Copyright (C) 2007-2011 Éric Cassar (Cyan).

    "Automatic Save Folder" is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    "Automatic Save Folder" is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with "Automatic Save Folder".  If not, see <http://www.gnu.org/licenses/>.

 * ***** END LICENSE BLOCK ***** */
 var automatic_save_folder = {
		prefManager: Components.classes["@mozilla.org/preferences-service;1"]
                         .getService(Components.interfaces.nsIPrefBranch),
							
		stringbundle: Components.classes["@mozilla.org/intl/stringbundle;1"]
                   .getService(Components.interfaces.nsIStringBundleService)
                   .createBundle("chrome://asf/locale/asf.properties"),

	add_load: function () {
		
		var currentdomain = window.opener.document.getElementById("asf-currentDL-domain").value;
		var currentfilename = window.opener.document.getElementById("asf-currentDL-filename").value ;
		
		var radio_domain_all = window.document.getElementById("asf-addedit-radio-domain-all");
		var radio_domain_edited = window.document.getElementById("asf-addedit-radio-domain");
		var radio_filename_all = window.document.getElementById("asf-addedit-radio-filename-all");
		var radio_filename_edited = window.document.getElementById("asf-addedit-radio-filename");
		
		// enable or disable the local saving path text input
		var select_variable_mode = window.opener.document.getElementById("asf-variablemode");
		var select_folder_input = document.getElementById("asf-addedit-folder");
		if(select_variable_mode.checked == true)
		{
			select_folder_input.readOnly   = false;
		}
		if(select_variable_mode.checked == false)
		{
			select_folder_input.readOnly   = true;
		}
		
		// pre-filled data
		if (currentdomain != "") 
		{   // if opened from save window, domain and filename is autofilled, and radio need to be selected on 1 and value set to 1
			
			radio_domain_edited.checked;
			radio_filename_edited.checked;
			
			//set radio button to state 1 (if the user never clic on a radio, the value is null, even if the radio is selected at the right position)
			document.getElementById('radio-addedit-domain').value = 1 ;
			document.getElementById('radio-addedit-filename').value = 1 ;
			
			// set the data into the fields
			var domain = document.getElementById("asf-addedit-domain");
			var filename = document.getElementById("asf-addedit-filename");
			
			domain.value = currentdomain ;
			filename.value = currentfilename ;
			
		} // else, nothing to fill, radio button set to 0
		else 
		{
			radio_domain_all.checked;
			radio_filename_all.checked;
			
			//set radio button to state 0 (if the user never clic on a radio, the value is null, even if the radio is not checked)
			document.getElementById('radio-addedit-domain').value = 0 ;
			document.getElementById('radio-addedit-filename').value = 0 ;
		}
		
		sizeToContent();
		this.asf_toggleradio_domain();
		this.asf_toggleradio_filename();
		this.read_all_filterpath();
	},


	edit_load: function () {
		sizeToContent();
		this.asf_loadData();
		this.asf_toggleradio_domain();
		this.asf_toggleradio_filename();
		this.read_all_filterpath();
	},


	loadUnicodeString: function (pref_place) {
		try 
		{
			return this.prefManager.getComplexValue(pref_place, Components.interfaces.nsISupportsString).data;
		}
		catch (e)
		{ }
		return "";
	},


	browsedir_addedit: function () {
		var current_folder_input = document.getElementById("asf-addedit-folder").value;
		
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		
		var filepickerdescription = this.stringbundle.GetStringFromName("select_folder");
		fp.init(window, filepickerdescription, nsIFilePicker.modeGetFolder);
		//fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		
		// locate current directory
		current_folder_input = this.createValidDestination(current_folder_input);	
		if (current_folder_input !== false) fp.displayDirectory = current_folder_input;
		
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK)
		{
			var asf_url = fp.file.path;
			
			// Set the data into the input box
			document.getElementById("asf-addedit-folder").value = asf_url;
		}
	},


	createValidDestination: function (path) {
		if (!path) return false;
		if (this.trim(path).length==0) return false;
		var directory = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		
		try 
		{
			directory.initWithPath(path);
			if (directory.exists()) 
				return directory;
		}
		catch(e) {return false;}
		return false;
	},


	asf_loadData: function () {
		// enable or disable the local saving path user input
		var select_variable_mode = window.opener.document.getElementById("asf-variablemode");
		var select_folder_input = document.getElementById("asf-addedit-folder");
		if (select_variable_mode.checked == true)
		{
			select_folder_input.readOnly   = false;
		}
		if (select_variable_mode.checked == false)
		{
			select_folder_input.readOnly   = true;
		}
		
		
		var tree = window.opener.document.getElementById("asf-filterList") ;
		var idx = tree.currentIndex;
		if (idx < 0) 
		{
			return;
		}
		
		var domain = tree.view.getCellText(idx,tree.columns.getColumnAt(0));
		var filename = tree.view.getCellText(idx,tree.columns.getColumnAt(1));
		var folder = tree.view.getCellText(idx,tree.columns.getColumnAt(2));
		var active = tree.view.getCellValue(idx,tree.columns.getColumnAt(3));
		var domain_regexp = tree.view.getCellValue(idx,tree.columns.getColumnAt(4));
		var filename_regexp = tree.view.getCellValue(idx,tree.columns.getColumnAt(5));
		active = (active == "true" ? true : false) ;
		domain_regexp = (domain_regexp == "true" ? true : false) ;
		filename_regexp = (filename_regexp == "true" ? true : false) ;
		
		var radio_domain = document.getElementById("radio-addedit-domain") ;		
		var radio_filename = document.getElementById("radio-addedit-filename") ;
		
		if (domain == "*") 
		{
			radio_domain.value = 0;
		}
		else
		{
			radio_domain.value = 1;
			document.getElementById("asf-addedit-domain").value = domain;
			
			document.getElementById("asf-addedit-domain-regexp").checked = domain_regexp;
		}
		
		if (filename == "*")
		{
			radio_filename.value = 0;
		}
		else
		{
			radio_filename.value = 1;
			document.getElementById("asf-addedit-filename").value = filename;
			
			document.getElementById("asf-addedit-filename-regexp").checked = filename_regexp;
		}
		
		document.getElementById("asf-addedit-folder").value = folder ;	
	},


	asf_toggleradio_domain: function ()	{
		var select_addedit_radio_all = document.getElementById("asf-addedit-radio-domain-all");
		var select_addedit_radio = document.getElementById("asf-addedit-radio-domain");
		var select_addedit_input = document.getElementById("asf-addedit-domain");
		var select_addedit_chk = document.getElementById("asf-addedit-domain-regexp");
		
		if (select_addedit_radio_all.selected == true)
		{
			select_addedit_input.disabled = true;
			select_addedit_chk.disabled   = true;
		}
		
		if (select_addedit_radio.selected == true)
		{
			select_addedit_input.disabled = false;
			select_addedit_chk.disabled   = false;
		}
	},


	asf_toggleradio_filename: function () {
		var select_addedit_radio_all = document.getElementById("asf-addedit-radio-filename-all");
		var select_addedit_radio = document.getElementById("asf-addedit-radio-filename");
		var select_addedit_input = document.getElementById("asf-addedit-filename");
		var select_addedit_chk = document.getElementById("asf-addedit-filename-regexp");
		
		if (select_addedit_radio_all.selected == true)
		{
			select_addedit_input.disabled = true;
			select_addedit_chk.disabled   = true;
		}
		
		if (select_addedit_radio.selected == true)
		{
			select_addedit_input.disabled = false;
			select_addedit_chk.disabled   = false;
		}
	},


	trim: function (string) {
		return string.replace(/(^\s*)|(\s*$)/g,'');
	},


	//
	// ADD new filter in tree
	//
	asf_add: function () {
		var instantApply = this.prefManager.getBoolPref("browser.preferences.instantApply");
	// get the domain
	//
		var domain_radio = document.getElementById('radio-addedit-domain');
		var domain = document.getElementById('asf-addedit-domain');
		var domain_regexp = document.getElementById('asf-addedit-domain-regexp').checked;
		if (domain_radio.value == 0)
		{
			var rule = "*";
		}
		else
		{
			var rule = this.trim(domain.value);
		}
		
		if (rule != "")
		{
			if (rule == "*") domain_regexp = false;
			var domain = rule;
		}
		else
		{
			var err_domain = this.stringbundle.GetStringFromName("nodata.domain");
			alert(err_domain);
			var error = true;
		}
		
	// get the filename
	//
		var filename_radio = document.getElementById('radio-addedit-filename');
		var filename = document.getElementById('asf-addedit-filename');
		var filename_regexp = document.getElementById('asf-addedit-filename-regexp').checked;
		if (filename_radio.value == 0)
		{
			var rule = "*";
		}
		else
		{
			var rule = this.trim(filename.value);
		}
		
		if (rule != "") 
		{
			if (rule == "*") filename_regexp = false;
			var filename = rule;
		}
		else
		{
			var err_filename = this.stringbundle.GetStringFromName("nodata.filename");
			alert(err_filename);
			var error = true;
		}
		
		
	//get the foldername
	//
		var folder = document.getElementById('asf-addedit-folder');
		   
		var rule = this.trim(folder.value);
		if (rule == "")
		{
			var err_folder = this.stringbundle.GetStringFromName("nodata.folder");
			alert(err_folder);
			var error = true;
		}
		else
		{
			var folder = rule;
		}		
			
			
			
		if (error != true)
		{
			// adding into the tree
			var filter = window.opener.document.getElementById('asf-filterList');
			var rules = window.opener.document.getElementById('asf-filterChilds');
			var item = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treeitem');
			var row = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treerow');
			var c1 = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treecell');
			var c2 = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treecell');  
			var c3 = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treecell');
			var c4 = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treecell');
			var c5 = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treecell');
			var c6 = window.opener.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'treecell');
			c1.setAttribute('label', domain);
			c2.setAttribute('label', filename);
			c3.setAttribute('label', folder);
			c4.setAttribute('value', true); // active state
			c5.setAttribute('value', domain_regexp);
			c6.setAttribute('value', filename_regexp);
			c1.setAttribute('editable', false);
			c2.setAttribute('editable', false);
			c3.setAttribute('editable', false);
			c5.setAttribute('editable', false);
			c6.setAttribute('editable', false);
			row.appendChild(c1);
			row.appendChild(c2);
			row.appendChild(c3);
			row.appendChild(c4);
			row.appendChild(c5);
			row.appendChild(c6);
			item.appendChild(row);
			rules.appendChild(item);
			
			//select the new filter	
			var idx = rules.childNodes.length-1; 
			filter.view.selection.select(idx);
			filter.boxObject.ensureRowIsVisible(idx);
			
			filter.focus();
			window.close();
			
			//autosave when adding a filter
			if (instantApply)
			{
				//save the filters
				window.opener.automatic_save_folder.asf_savefilters();
			}
			
			// set the row's color
			window.opener.automatic_save_folder.set_row_color();
		}
	},


	asf_edit: function () {
		var instantApply = this.prefManager.getBoolPref("browser.preferences.instantApply");
	// get the domain
	// 
		var domain_radio = document.getElementById('radio-addedit-domain');
		var domain = document.getElementById('asf-addedit-domain');
		var domain_regexp = document.getElementById('asf-addedit-domain-regexp').checked;
		if (domain_radio.value == 0)
		{
			var rule = "*";
		}
		else
		{
			var rule = this.trim(domain.value);
		}
		
		if (rule != "") 
		{
			if (rule == "*") domain_regexp = false;
			var domain = rule;
		}
		else
		{
			var err_domain = this.stringbundle.GetStringFromName("nodata.domain");
			alert(err_domain);
			var error = true;
		}
		
	// get the filename
	// 
		var filename_radio = document.getElementById('radio-addedit-filename');
		var filename = document.getElementById('asf-addedit-filename');
		var filename_regexp = document.getElementById('asf-addedit-filename-regexp').checked;
		if (filename_radio.value == 0)
		{
			var rule = "*";
		}
		else
		{
			var rule = this.trim(filename.value);
		}
		
		if (rule != "")
		{
			if (rule == "*") filename_regexp = false;
			var filename = rule;
		}
		else
		{
			var err_filename = this.stringbundle.GetStringFromName("nodata.filename");
			alert(err_filename);
			var error = true;
		}
		
		
	//get the foldername
	//
		var folder = document.getElementById('asf-addedit-folder');
		
		var rule = this.trim(folder.value);
		if (rule == "")
		{
			var err_folder = this.stringbundle.GetStringFromName("nodata.folder");
			alert(err_folder);
			var error = true;
		}
		else
		{
			var folder = rule;
		}
		
		if (error != true)
		{
			var tree = window.opener.document.getElementById("asf-filterList") ;
			var idx = tree.currentIndex;
			if (idx < 0) 
			{
				return;
			}
			
			
			var theValue = tree.treeBoxObject.view.getItemAtIndex(idx);
			var test = theValue.firstChild.childNodes[0].getAttribute("label");
			
			theValue.firstChild.childNodes[0].setAttribute("label", domain );
			theValue.firstChild.childNodes[1].setAttribute("label", filename );
			theValue.firstChild.childNodes[2].setAttribute("label", folder );
		//	theValue.firstChild.childNodes[3].setAttribute("value", active ); // active state
			theValue.firstChild.childNodes[4].setAttribute("value", domain_regexp );
			theValue.firstChild.childNodes[5].setAttribute("value", filename_regexp );
			
			//select the edited filter	
			tree.view.selection.select(idx);
			tree.boxObject.ensureRowIsVisible(idx);
			
			tree.focus();
			window.close();
			
			//autosave when editing a filter
			if (instantApply)
			{
			//save the filters
				window.opener.automatic_save_folder.asf_savefilters();
			}
			
			// set the row's color
			window.opener.automatic_save_folder.set_row_color();
		}
	},


	//
	// the 2 functions bellow are the drop-down path menu for the "add & edit" window
	//
	read_all_filterpath: function() {
		var list = document.getElementById('asf-addedit-folder');
		var menupopup = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menupopup');
		var tree = window.opener.document.getElementById("asf-filterList");
		
		// Check if there is any filter in list
		var nbrfilters = tree.view.rowCount;
		var path = "";
		
		
		// Delete active list before repopulating (righ-clicking the menu sends an onLoad event again)
		for (var i=list.childNodes.length-1 ; i>=0 ; i--) 
		{
			list.removeChild(list.childNodes[i]);
		}
		
		// Write each path to the menupopup
		var pathlist = new Array();
		var pathlist_defaultforceontop = window.opener.document.getElementById("asf-pathlist_defaultforceontop").checked;
		var defaultfolder = window.opener.document.getElementById("asf-default-folder").value;
		var j = 0;
		if (pathlist_defaultforceontop)
		{
			var menuitem = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem');
			menuitem.setAttribute('label', defaultfolder);
			menuitem.setAttribute('crop', 'center');
			menuitem.setAttribute('value', defaultfolder);
			menupopup.appendChild(menuitem);
		}
		else
		{
			pathlist[0] = defaultfolder;
			j++;
		}
		
		for (var i = 0; i < nbrfilters; i++)
		{
			// read the filter number i
			path = tree.view.getCellText(i,tree.columns.getColumnAt("2"));
			
			if (this.indexInArray(pathlist, path) < 0)
			{ 
				pathlist[j++]= path;
			}
		}
		
		var pathlist_sort_alpha = window.opener.document.getElementById("asf-pathlist_alphasort").checked;
		if (pathlist_sort_alpha) pathlist.sort(); 
		
		
		for (var i = 0; i < pathlist.length; i++)
		{
			path = pathlist[i];
			
			var menuitem = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem');
			menuitem.setAttribute('label', path);
			menuitem.setAttribute('crop', 'center');
			menuitem.setAttribute('value', path);
			menupopup.appendChild(menuitem);
		}
		
		// Populate the path list into the menu
		list.appendChild(menupopup);
		
	},


	indexInArray: function (arr,val) {
		val = val.replace(/\\/g,'\\\\');
		var test_regexp = new RegExp("^"+val+"$");
		var data = "";
		for(var i=0;i<arr.length;i++) 
		{
			if(test_regexp.test(arr[i])) return i;
		}
		return -1;
	},


	readHiddenPref: function(pref_place, type, ret) {
		try 
		{
			switch (type)
			{
				case "bool": return this.prefManager.getBoolPref(pref_place);
				case "int" : return this.prefManager.getIntPref(pref_place);
				case "char": return this.prefManager.getCharPref(pref_place);
				case "complex": return this.prefManager.getComplexValue(pref_place, Components.interfaces.nsISupportsString).data;
			}
		} 
		catch(e) 
		{
			return ret; // return default value if pref doesn't exist
		} 
	}
};