import os

file_path = r"e:\DATA\Ngoding\birthday-saas\src\components\dashboard\CreateCardWizard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Stepper Labels
content = content.replace('"Konfirmasi"', '"Momen Spesial"')

# 2. Update PRESET_SONGS
old_songs = """const PRESET_SONGS = [
  { id: 0, title: "Perfect", artist: "Ed Sheeran", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", category: "Romantis", duration: "4:23", coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop" },
  { id: 1, title: "A Thousand Years", artist: "Christina Perri", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", category: "Romantis", duration: "4:45", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=150&auto=format&fit=crop" },
  { id: 2, title: "Beautiful in White", artist: "Westlife", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", category: "Romantis", duration: "3:56", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=150&auto=format&fit=crop" },
  { id: 3, title: "Can't Help Falling in Love", artist: "Elvis Presley", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", category: "Romantis", duration: "3:01", coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f56468?q=80&w=150&auto=format&fit=crop" },
  { id: 4, title: "You Are The Reason", artist: "Calum Scott", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", category: "Romantis", duration: "3:24", coverUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150&auto=format&fit=crop" },
  { id: 5, title: "Here With You", artist: "Dido", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", category: "Akustik", duration: "4:13", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=150&auto=format&fit=crop" },
];"""

new_songs = """const PRESET_SONGS = [
  { id: 1, title: "Perfect", category: "Romantis", artist: "Ed Sheeran", duration: "4:23", url: "/music/perfect.mp3", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop" },
  { id: 2, title: "A Thousand Years", category: "Romantis", artist: "Christina Perri", duration: "4:45", url: "/music/a-thousand-years.mp3", coverUrl: "https://images.unsplash.com/photo-1518895949257-761bf5e92159?q=80&w=400&auto=format&fit=crop" },
  { id: 3, title: "Beautiful in White", category: "Romantis", artist: "Westlife", duration: "3:56", url: "/music/beautiful-in-white.mp3", coverUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=400&auto=format&fit=crop" },
  { id: 4, title: "Can't Help Falling in Love", category: "Romantis", artist: "Elvis Presley", duration: "3:01", url: "/music/cant-help-falling-in-love.mp3", coverUrl: "https://images.unsplash.com/photo-1469504512102-900f29606341?q=80&w=400&auto=format&fit=crop" },
  { id: 5, title: "You Are The Reason", category: "Romantis", artist: "Calum Scott", duration: "3:24", url: "/music/you-are-the-reason.mp3", coverUrl: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?q=80&w=400&auto=format&fit=crop" },
  { id: 6, title: "Shape of My Heart", category: "Bahagia", artist: "Backstreet Boys", duration: "3:47", url: "/music/shape-of-my-heart.mp3", coverUrl: "https://images.unsplash.com/photo-1483808161634-29aa1b1151c0?q=80&w=400&auto=format&fit=crop" },
  { id: 7, title: "Here Without You", category: "Akustik", artist: "3 Doors Down", duration: "3:58", url: "/music/here-without-you.mp3", coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=400&auto=format&fit=crop" },
  { id: 8, title: "Dandelions", category: "Romantis", artist: "Ruth B.", duration: "3:53", url: "/music/dandelions.mp3", coverUrl: "https://images.unsplash.com/photo-1490750967868-88cb4ec0927e?q=80&w=400&auto=format&fit=crop" },
  { id: 9, title: "Summer Eyes", category: "Instrumental", artist: "OHYUL of LNGSHOT", duration: "3:16", url: "/music/summer-eyes.mp3", coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop" },
];"""

content = content.replace(old_songs, new_songs)

# 3. Swap Step 2 and Step 3
step2_start = content.find('{/* ====== STEP 2: Foto (Optional Skip) ====== */}')
step3_start = content.find('{/* ====== STEP 3: Pilih Lagu ====== */}')
step4_start = content.find('{/* ====== STEP 4: Pesan & Surat ====== */}')

if step2_start == -1 or step3_start == -1 or step4_start == -1:
    print("Could not find step markers")
    exit(1)

old_step2 = content[step2_start:step3_start]
old_step2 = old_step2.replace('{/* ====== STEP 2: Foto (Optional Skip) ====== */}', '{/* ====== STEP 3: Foto (Optional Skip) ====== */}')
old_step2 = old_step2.replace('{step === 2 && (', '{step === 3 && (')
old_step2 = old_step2.replace('onClick={() => setStep(1)}', 'onClick={() => setStep(2)}')
old_step2 = old_step2.replace('onClick={() => setStep(3)}', 'onClick={() => setStep(4)}')
old_step2 = old_step2.replace('Lanjut ke Pilih Musik', 'Lanjut ke Desain')

new_step2 = """{/* ====== STEP 2: Pilih Lagu ====== */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.step1TwoCol}>
            {/* Left Column: List */}
            <div className={styles.step1LeftCol}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                <div style={{ background: 'rgba(212, 165, 165, 0.2)', padding: '12px', borderRadius: '16px', color: 'var(--brand-primary)' }}>
                  <Music size={32} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Pilih Musik Latar</h2>
                  <p className={styles.cardDesc} style={{ margin: '4px 0 0 0' }}>
                    Pilih lagu yang akan diputar otomatis saat kado dibuka.
                  </p>
                </div>
              </div>

              <div className={styles.musicFilters} style={{ marginTop: '24px' }}>
                {["Semua", "Romantis", "Bahagia", "Akustik", "Instrumental"].map(cat => (
                  <button 
                    key={cat} 
                    className={`${styles.musicFilterBtn} ${activeCategory === cat ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === "Semua" && <Music size={14} />}
                    {cat === "Romantis" && <Heart size={14} />}
                    {cat === "Bahagia" && <Smile size={14} />}
                    {cat === "Akustik" && <Guitar size={14} />}
                    {cat === "Instrumental" && <Music size={14} />}
                    {cat}
                  </button>
                ))}
              </div>

              <div className={styles.musicSearchRow}>
                <div className={styles.musicSearchBox}>
                  <Search size={16} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Cari lagu, artis, atau mood..." 
                    className={styles.musicSearchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select className={styles.musicSortSelect}>
                  <option value="newest">Terbaru</option>
                  <option value="popular">Terpopuler</option>
                </select>
              </div>

              <table className={styles.musicTable}>
                <thead>
                  <tr>
                    <th>Lagu</th>
                    <th>Artis</th>
                    <th>Durasi</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song) => (
                    <tr 
                      key={song.id} 
                      className={`${styles.musicTableRow} ${presetMusic === song.id ? styles.active : ""}`}
                      onClick={() => {
                        setPresetMusic(song.id);
                        setMusicFile(null);
                        if (audioRef.current && song.url) {
                          audioRef.current.src = song.url;
                          audioRef.current.play().catch(() => {});
                          setIsPlaying(true);
                        }
                      }}
                    >
                      <td className={styles.musicTableCell}>
                        <div className={styles.musicInfo}>
                          <div className={styles.musicCover}>
                            <img src={song.coverUrl} alt={song.title} />
                            <div className={styles.musicCoverOverlay}>
                              {presetMusic === song.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </div>
                          </div>
                          <div>
                            <div className={styles.musicTitleWrap}>
                              <div className={styles.musicTitle}>{song.title}</div>
                              <div className={styles.musicTag}>{song.category}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.musicTableCell}>
                        <div className={styles.musicArtist}>{song.artist}</div>
                      </td>
                      <td className={styles.musicTableCell}>
                        <div className={styles.musicDuration}>{song.duration}</div>
                      </td>
                      <td className={styles.musicTableCell} style={{ textAlign: 'right' }}>
                        {presetMusic === song.id ? (
                          <CheckCircle2 size={20} color="var(--brand-primary)" />
                        ) : (
                          <MoreHorizontal size={20} color="var(--neutral-400)" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button 
                className={styles.dashedBtn}
                style={{ marginTop: '16px', color: 'var(--neutral-500)', borderColor: 'var(--neutral-200)' }}
              >
                Muat lebih banyak <ChevronDown size={16} />
              </button>

              <div className={styles.actions} style={{ marginTop: '24px' }}>
                <button className={styles.btnSecondary} onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Kembali
                </button>
                <button className={styles.btnPrimary} onClick={() => setStep(3)}>
                  Lanjut ke Galeri <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: Player Sidebar */}
            <div className={styles.step1RightCol}>
              <div className={styles.playerSidebar}>
                <div className={styles.playerHeader}>
                  <Music size={16} /> Pratinjau Lagu
                </div>
                
                {(() => {
                  const currentSong = PRESET_SONGS.find(s => s.id === presetMusic) || PRESET_SONGS[0];
                  return (
                    <>
                      <div className={styles.playerArtwork}>
                        <img src={currentSong.coverUrl} alt={currentSong.title} />
                      </div>
                      
                      <div className={styles.playerMeta}>
                        <div className={styles.musicTitleWrap} style={{ marginBottom: 4 }}>
                          <div className={styles.playerTitle}>{currentSong.title}</div>
                          <div className={styles.musicTag} style={{ fontSize: '0.7rem' }}>{currentSong.category}</div>
                        </div>
                        <div className={styles.playerArtist}>{currentSong.artist}</div>
                      </div>

                      <div className={styles.playerControls}>
                        <div className={styles.playerTimeline}>
                          <span className={styles.playerTimeText}>{formatTime(currentTime)}</span>
                          <input 
                            type="range" 
                            className={styles.playerSlider}
                            min="0" 
                            max={duration || 100} 
                            value={currentTime} 
                            onChange={handleSeek} 
                          />
                          <span className={styles.playerTimeText}>{formatTime(duration)}</span>
                        </div>
                        
                        <div className={styles.playerButtons}>
                          <button className={styles.playerBtn}><SkipBack size={24} fill="currentColor" /></button>
                          <button 
                            className={styles.playerBtnPlay}
                            onClick={() => {
                              if (audioRef.current) {
                                if (isPlaying) {
                                  audioRef.current.pause();
                                  setIsPlaying(false);
                                } else {
                                  audioRef.current.play().catch(() => {});
                                  setIsPlaying(true);
                                }
                              }
                            }}
                          >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />}
                          </button>
                          <button className={styles.playerBtn}><SkipForward size={24} fill="currentColor" /></button>
                        </div>
                        
                        <div className={styles.playerVolume}>
                          <Volume2 size={16} />
                          <input 
                            type="range" 
                            className={styles.playerVolumeSlider}
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume} 
                            onChange={(e) => {
                              const vol = parseFloat(e.target.value);
                              setVolume(vol);
                              if (audioRef.current) audioRef.current.volume = vol;
                            }} 
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className={styles.uploadMusicBox}>
                  <div className={styles.uploadMusicLabel}>Atau unggah musik sendiri</div>
                  <div 
                    className={`${styles.uploadArea} ${isDraggingMusic ? styles.dragging : ''}`}
                    style={{ padding: '24px 16px', minHeight: 'auto' }}
                    onClick={() => musicInputRef.current?.click()} 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingMusic(true); }}
                    onDragLeave={() => setIsDraggingMusic(false)}
                    onDrop={handleMusicDrop}
                  >
                    {musicFile ? (
                      <div style={{ textAlign: 'center' }}>
                        <Music size={24} style={{ color: 'var(--brand-primary)', marginBottom: 8 }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 4 }}>{musicFile.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: 12 }}>{(musicFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                        <button 
                          className={styles.btnSecondary}
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={(e) => { e.stopPropagation(); removeMusic(); }}
                        >
                          Hapus File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={styles.uploadIconWrapper} style={{ width: 40, height: 40, marginBottom: 12 }}>
                          <CloudUpload size={20} />
                        </div>
                        <h3 className={styles.uploadTitle} style={{ fontSize: '0.9rem' }}>
                          Unggah dari perangkat
                        </h3>
                        <p className={styles.uploadSubtitle} style={{ fontSize: '0.75rem' }}>
                          MP3, WAV • Maks. 5 MB
                        </p>
                      </>
                    )}
                    <input
                      ref={musicInputRef}
                      type="file"
                      accept="audio/mp3,audio/wav,audio/mpeg"
                      onChange={handleMusicSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
"""

content = content.replace("Lanjut ke Pilih Musik", "Lanjut ke Pilih Musik") # Revert if already modified, wait it's just simpler
content = content.replace("Lanjut ke Pilih Foto <ArrowRight", "Lanjut ke Pilih Musik <ArrowRight") 
content = content.replace("Lanjut ke Pilih Foto", "Lanjut ke Pilih Musik") # For safety

before_step2 = content[:step2_start]
after_step4 = content[step4_start:]

final_content = before_step2 + new_step2 + old_step2 + after_step4

with open(file_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print("Updated CreateCardWizard.tsx successfully")
