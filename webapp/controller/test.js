navigator.camera.getPicture(
	function (sFileUri) {
		window.resolveLocalFileSystemURL(
			sFileUri,
			function (oFileEntry) {
				oFileEntry.file(
					function (oFile) {
						let oFileReader = new FileReader();
						oFileReader.onloadend = function(oEvent) {
							if (oEvent.target.error != null) {
								throw new FileReaderException({
									sMessage: "File read failure, file details:\n" + JSON.stringify(oFile, null, 4),
									oCausedBy: oEvent.target.error
								});
							} else {
								$.ajax({
								    type: "PUT",
								    url: oData.__metadata.edit_media,
								    data: oFileReader.result,
								    success: function (data) {
								        if (data.ok) {
											alert("Media updated. Src: " + oData.__metadata.media_src);
										} else {
											alert("Update failed! Status: " + oResponse.status);
										}
								    }
								});
							}
						};
						oFileReader.readAsArrayBuffer(oFile);
					},
					function (oError) {
						throw new FileSystemException({
							sMessage: "Failed to get file from fileEntry:\n" + JSON.stringify(oFileEntry, null, 4),
							oCausedBy: oError
						});
					});
			},
			function (oError) {
				throw new FileSystemException({
					sMessage: "Failed to resolve local file: '" + sLocalFileSystemURL + "'",
					oCausedBy: oError
				});
			});
	},
	function (oError) {
		throw new CameraException({
			sMessage: "Failed to make camera shot with options: '" + JSON.stringify(oCameraOptions) + "'",
			oCausedBy: oError
		});
	}, {
		quality: 50,
		destinationType: navigator.camera.DestinationType.FILE_URI
	});
	
	
.then(oFileUri => FileSystemFunctions.resolveLocalFileSystemURL(oFileUri))
	.then(oFileEntry => FileSystemFunctions.getFileFromFileEntry(oFileEntry))
	.then(oFile => FileReaderFunctions.readAsArrayBuffer(oFile))
	.then(aArrayBuffer => fetch(oData.__metadata.edit_media, {
		method: 'PUT',
		headers: {
			"Accept": "application/json",
			"Content-Type": "image/jpeg",
		},
		body: new Blob([aArrayBuffer], {
			type: 'image/jpeg'
		})
	}))
	.then(oResponse => {
		if (oResponse.ok) {
			alert("Media updated. Src: " + oData.__metadata.media_src);
		} else {
			alert("Update failed! Status: " + oResponse.status);
		}
	});