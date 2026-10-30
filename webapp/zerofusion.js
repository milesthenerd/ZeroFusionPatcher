const ZeroFusion = (function () {
	const ROM_SIZE = 8 * 1024 * 1024;
	const ROMS = {
		fusion: { crc32: 0x6c75479c, name: 'Metroid Fusion (USA)' },
		zm: { crc32: 0x5c61a844, name: 'Metroid - Zero Mission (USA)' }
	};
	const other = { fusion: 'zm', zm: 'fusion' };

	const check = function (which, binFile) {
		if (binFile.fileSize === ROM_SIZE) {
			const crc32 = binFile.hashCRC32();
			if (crc32 === ROMS[which].crc32)
				return null;
			if (crc32 === ROMS[other[which]].crc32)
				return 'That\'s ' + ROMS[other[which]].name + ', it goes in the other box.';
		}
		return 'Not ' + ROMS[which].name + '. Use an unmodified US ROM (not a randomized or patched one).';
	};

	const join = function (fusion, zm) {
		const joined = new BinFile(ROM_SIZE * 2);
		joined._u8array.set(fusion._u8array, 0);
		joined._u8array.set(zm._u8array, ROM_SIZE);
		joined.fileName = 'Metroid Zero Fusion.gba';
		return joined;
	};

	const initialize = function () {
		const loaded = { fusion: null, zm: null };
		const status = document.getElementById('zero-fusion-status');

		const update = function () {
			if (loaded.fusion && loaded.zm) {
				status.innerHTML = 'Both ROMs OK. Now pick the seed\'s patch file (.bps).';
				status.className = 'zero-fusion-ok';
				RomPatcherWeb.provideRomFile(join(loaded.fusion, loaded.zm), true);
			}
		};

		['fusion', 'zm'].forEach(function (which) {
			document.getElementById('zero-fusion-input-' + which).addEventListener('change', function () {
				loaded[which] = null;
				if (!this.files || !this.files.length)
					return;
				status.innerHTML = 'Checking...';
				status.className = '';
				new BinFile(this.files[0], function (binFile) {
					const error = check(which, binFile);
					if (error) {
						status.innerHTML = error;
						status.className = 'zero-fusion-error';
						return;
					}
					loaded[which] = binFile;
					status.innerHTML = ROMS[which].name + ' OK.';
					update();
				});
			});
		});
	};

	return { ROM_SIZE: ROM_SIZE, ROMS: ROMS, check: check, join: join, initialize: initialize };
}());

if (typeof module !== 'undefined' && module.exports)
	module.exports = ZeroFusion;
else
	window.addEventListener('load', ZeroFusion.initialize);
