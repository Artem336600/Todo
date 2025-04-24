document.addEventListener('DOMContentLoaded', function() {
    // Получение ссылок на элементы DOM
    const projectSelect = document.getElementById('project-select');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    const projectNameInput = document.getElementById('project-name');
    const projectIdInput = document.getElementById('project-id');
    const structureContainer = document.getElementById('structure-container');
    const emptyStructure = document.getElementById('empty-structure');
    const addFolderBtn = document.getElementById('add-folder-btn');
    const addFileBtn = document.getElementById('add-file-btn');
    const saveProjectBtn = document.getElementById('save-project-btn');
    const statusMessage = document.getElementById('status-message');
    const fileTemplate = document.getElementById('file-template');
    const folderTemplate = document.getElementById('folder-template');
    const importJsonBtn = document.getElementById('import-json-btn');
    const jsonFileInput = document.getElementById('json-file-input');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const manualJsonBtn = document.getElementById('manual-json-btn');
    const jsonModal = document.getElementById('json-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const jsonInput = document.getElementById('json-input');
    const applyJsonBtn = document.getElementById('apply-json-btn');
    const showTreeBtn = document.getElementById('show-tree-btn');
    const treeModal = document.getElementById('tree-modal');
    const closeTreeModalBtn = document.getElementById('close-tree-modal-btn');
    const treeModeSelect = document.getElementById('tree-mode-select');
    const treeOutput = document.getElementById('tree-output');
    
    // Получаем ссылки на элементы модального окна редактирования файла
    let fileEditModal = document.getElementById('file-edit-modal');
    let closeFileEditModalBtn, fileEditTitle, modalFileName, modalFileDescription, modalIoPairs, modalAddPairBtn, saveFileEditBtn, cancelFileEditBtn;
    
    // Функция для создания модального окна редактирования файла, если его нет в DOM
    function createFileEditModalIfNeeded() {
        if (fileEditModal) return true; // Окно уже существует
        
        console.log("Создаю модальное окно для редактирования файла");
        
        // Создаем модальное окно программно
        fileEditModal = document.createElement('div');
        fileEditModal.id = 'file-edit-modal';
        fileEditModal.className = 'modal';
        
        fileEditModal.innerHTML = `
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3 id="file-edit-title">Редактирование файла</h3>
                    <button id="close-file-edit-modal-btn" class="btn-icon">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Имя файла:</label>
                        <input type="text" id="modal-file-name" placeholder="Введите имя файла">
                    </div>
                    
                    <div class="form-group">
                        <label>Описание:</label>
                        <textarea id="modal-file-description" placeholder="Опишите назначение файла"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Варианты входных и выходных данных:</label>
                        <div class="mock-container io-pairs" id="modal-io-pairs">
                            <!-- Сюда будут добавляться пары ввод-вывод -->
                        </div>
                        <button type="button" id="modal-add-pair-btn" class="add-pair-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                            </svg>
                            Добавить пару "вход-выход"
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="save-file-edit-btn">Сохранить</button>
                    <button id="cancel-file-edit-btn">Отмена</button>
                </div>
            </div>
        `;
        
        // Добавляем модальное окно в DOM
        document.body.appendChild(fileEditModal);
        
        // Обновляем ссылки на элементы модального окна
        closeFileEditModalBtn = document.getElementById('close-file-edit-modal-btn');
        fileEditTitle = document.getElementById('file-edit-title');
        modalFileName = document.getElementById('modal-file-name');
        modalFileDescription = document.getElementById('modal-file-description');
        modalIoPairs = document.getElementById('modal-io-pairs');
        modalAddPairBtn = document.getElementById('modal-add-pair-btn');
        saveFileEditBtn = document.getElementById('save-file-edit-btn');
        cancelFileEditBtn = document.getElementById('cancel-file-edit-btn');
        
        // Добавляем обработчики событий
        if (closeFileEditModalBtn) closeFileEditModalBtn.addEventListener('click', closeFileEditModal);
        if (saveFileEditBtn) saveFileEditBtn.addEventListener('click', saveFileEdit);
        if (cancelFileEditBtn) cancelFileEditBtn.addEventListener('click', closeFileEditModal);
        if (modalAddPairBtn) modalAddPairBtn.addEventListener('click', addModalPair);
        
        // Закрытие модального окна при клике вне содержимого
        window.addEventListener('click', (e) => {
            if (e.target === fileEditModal) {
                closeFileEditModal();
            }
        });
        
        return true;
    }
    
    // Инициализируем обработчики только если модальное окно существует
    if (fileEditModal) {
        closeFileEditModalBtn = document.getElementById('close-file-edit-modal-btn');
        fileEditTitle = document.getElementById('file-edit-title');
        modalFileName = document.getElementById('modal-file-name');
        modalFileDescription = document.getElementById('modal-file-description');
        modalIoPairs = document.getElementById('modal-io-pairs');
        modalAddPairBtn = document.getElementById('modal-add-pair-btn');
        saveFileEditBtn = document.getElementById('save-file-edit-btn');
        cancelFileEditBtn = document.getElementById('cancel-file-edit-btn');
        
        // Обработчики событий для модального окна редактирования файла
        if (closeFileEditModalBtn) closeFileEditModalBtn.addEventListener('click', closeFileEditModal);
        if (saveFileEditBtn) saveFileEditBtn.addEventListener('click', saveFileEdit);
        if (cancelFileEditBtn) cancelFileEditBtn.addEventListener('click', closeFileEditModal);
        if (modalAddPairBtn) modalAddPairBtn.addEventListener('click', addModalPair);
        
        // Закрытие модального окна при клике вне содержимого
        window.addEventListener('click', (e) => {
            if (e.target === fileEditModal) {
                closeFileEditModal();
            }
        });
    }
    
    // Переменная для хранения ссылки на редактируемый файловый элемент
    let currentEditingFile = null;
    
    // Переменные для drag-and-drop
    let draggedItem = null;
    let dragTargetContainer = null;
    
    // Добавление обработчиков событий
    projectSelect.addEventListener('change', loadSelectedProject);
    deleteProjectBtn.addEventListener('click', deleteSelectedProject);
    addFolderBtn.addEventListener('click', () => addFolder(structureContainer));
    addFileBtn.addEventListener('click', () => addFile(structureContainer));
    saveProjectBtn.addEventListener('click', saveProject);
    importJsonBtn.addEventListener('click', () => jsonFileInput.click());
    jsonFileInput.addEventListener('change', handleJsonImport);
    exportJsonBtn.addEventListener('click', exportProjectJson);
    manualJsonBtn.addEventListener('click', openJsonModal);
    
    // Добавляем проверки на существование элементов перед добавлением обработчиков
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeJsonModal);
    if (applyJsonBtn) applyJsonBtn.addEventListener('click', applyManualJson);
    if (showTreeBtn) showTreeBtn.addEventListener('click', openTreeModal);
    if (closeTreeModalBtn) closeTreeModalBtn.addEventListener('click', closeTreeModal);
    if (treeModeSelect) treeModeSelect.addEventListener('change', updateTreeView);
    
    // Закрытие модальных окон при клике вне содержимого
    window.addEventListener('click', (e) => {
        if (e.target === jsonModal) {
            closeJsonModal();
        }
        if (treeModal && e.target === treeModal) {
            closeTreeModal();
        }
    });
    
    // Инициализация drag-and-drop функциональности
    initDragAndDrop();
    
    // Загрузка списка проектов при загрузке страницы
    loadProjects();
    
    // Функция обработки импорта JSON файла
    function handleJsonImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Проверка типа файла
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            showMessage('Выбранный файл не является JSON файлом', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Проверка валидности структуры
                if (!jsonData) {
                    throw new Error('Файл не содержит данных');
                }
                
                // Очистка текущей структуры проекта
                structureContainer.innerHTML = '';
                
                // Если есть название проекта, устанавливаем его
                if (jsonData.name) {
                    projectNameInput.value = jsonData.name;
                }
                
                // Если есть ID проекта, устанавливаем его
                if (jsonData.id) {
                    projectIdInput.value = jsonData.id;
                } else {
                    // Сбрасываем ID для создания нового проекта
                    projectIdInput.value = '';
                }
                
                // Загрузка структуры из разных форматов
                if (jsonData.structure && Array.isArray(jsonData.structure)) {
                    // Новый формат с массивом структуры
                    loadProjectStructure(jsonData.structure, structureContainer);
                } else if (jsonData.files && Array.isArray(jsonData.files)) {
                    // Старый формат с массивом файлов
                    jsonData.files.forEach(fileData => {
                        addFileWithData(structureContainer, fileData);
                    });
                } else if (Array.isArray(jsonData)) {
                    // Простой массив элементов структуры
                    loadProjectStructure(jsonData, structureContainer);
                } else {
                    throw new Error('Неподдерживаемый формат JSON файла');
                }
                
                // Проверка пустой структуры
                checkEmptyStructure();
                
                // Выбираем опцию "Новый проект" в списке
                projectSelect.value = 'new';
                
                showMessage('Структура проекта успешно импортирована', 'success');
                
                // Сбрасываем выбор файла, чтобы можно было загрузить тот же файл повторно
                jsonFileInput.value = '';
                
            } catch (error) {
                showMessage('Ошибка при импорте JSON: ' + error.message, 'error');
                console.error('Ошибка импорта JSON:', error);
                // Сбрасываем выбор файла
                jsonFileInput.value = '';
            }
        };
        
        reader.onerror = function() {
            showMessage('Ошибка чтения файла', 'error');
            // Сбрасываем выбор файла
            jsonFileInput.value = '';
        };
        
        // Чтение файла как текст
        reader.readAsText(file);
    }
    
    // Проверка на пустую структуру
    function checkEmptyStructure() {
        // Считаем реальные элементы структуры (папки и файлы), исключая служебные
        const realItemsCount = Array.from(structureContainer.children).filter(
            child => child.classList && 
                    (child.classList.contains('folder-item') || 
                     child.classList.contains('file-item'))
        ).length;
        
        if (realItemsCount === 0) {
            // Структура действительно пуста, показываем сообщение
            emptyStructure.style.display = 'block';
        } else {
            // В структуре есть реальные элементы, скрываем сообщение
            emptyStructure.style.display = 'none';
        }
    }
    
    // Функция инициализации drag-and-drop
    function initDragAndDrop() {
        // Делегирование событий на контейнер структуры
        structureContainer.addEventListener('dragstart', handleDragStart);
        structureContainer.addEventListener('dragover', handleDragOver);
        structureContainer.addEventListener('dragleave', handleDragLeave);
        structureContainer.addEventListener('drop', handleDrop);
        structureContainer.addEventListener('dragend', handleDragEnd);
        
        // Также обрабатываем события внутри папок
        document.addEventListener('dragstart', function(e) {
            if (e.target.classList.contains('file-item') || e.target.classList.contains('folder-item')) {
                handleDragStart(e);
            }
        }, false);
        
        document.addEventListener('dragover', function(e) {
            if (e.target.closest('.folder-items') || e.target.closest('.structure-container') || 
                e.target.classList.contains('file-item') || e.target.classList.contains('folder-item')) {
                handleDragOver(e);
            }
        }, false);
        
        document.addEventListener('dragleave', function(e) {
            if (e.target.closest('.folder-items') || e.target.closest('.structure-container') ||
                e.target.classList.contains('file-item') || e.target.classList.contains('folder-item')) {
                handleDragLeave(e);
            }
        }, false);
        
        document.addEventListener('drop', function(e) {
            if (e.target.closest('.folder-items') || e.target.closest('.structure-container') ||
                e.target.classList.contains('file-item') || e.target.classList.contains('folder-item')) {
                handleDrop(e);
            }
        }, false);
        
        document.addEventListener('dragend', handleDragEnd, false);
    }
    
    // Обработчик начала перетаскивания
    function handleDragStart(e) {
        // Проверяем, что перетаскивается файл или папка
        if (e.target.classList.contains('file-item') || e.target.classList.contains('folder-item')) {
            // Если щелчок был на кнопке или внутри формы, не начинаем перетаскивание
            if (e.target.closest('.item-actions button') || e.target.closest('input') || e.target.closest('textarea')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            draggedItem = e.target;
            
            // Создаем локальную копию ссылки на элемент
            const dragElement = draggedItem;
            
            // Задержка для добавления класса, чтобы стили начали применяться после начала перетаскивания
            requestAnimationFrame(() => {
                // Проверяем, что элемент все еще существует и не null
                if (dragElement && dragElement.classList) {
                    dragElement.classList.add('dragging');
                }
            });
            
            // Сохраняем информацию о перетаскиваемом элементе
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
            
            // Добавляем полупрозрачный эффект при перетаскивании
            draggedItem.style.opacity = '0.7';
        }
    }
    
    // Обработчик перетаскивания над целью
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Позволяет бросить элемент
        }
        
        e.dataTransfer.dropEffect = 'move';
        
        // Простая оптимизация: обрабатываем событие только каждые 30мс для лучшей производительности
        if (!window.dragOverThrottled) {
            window.dragOverThrottled = true;
            
            // Очищаем все индикаторы перетаскивания
            clearDragIndicators();
            
            // Если перетаскиваемся над контейнером папки
            if (e.target.closest('.folder-items')) {
                const folderItems = e.target.closest('.folder-items');
                folderItems.classList.add('drag-over');
                dragTargetContainer = folderItems;
                return false;
            }
            
            // Если перетаскиваемся над файлом или папкой
            const targetItem = e.target.closest('.file-item, .folder-item');
            
            if (targetItem && draggedItem && targetItem !== draggedItem) {
                // Определяем, вставить до или после целевого элемента
                const rect = targetItem.getBoundingClientRect();
                const y = e.clientY - rect.top;
                
                if (y < rect.height / 2) {
                    // Перетаскивание над верхней половиной элемента
                    targetItem.classList.add('drag-over-top');
                } else {
                    // Перетаскивание над нижней половиной элемента
                    targetItem.classList.add('drag-over-bottom');
                }
            }
            
            // Сбрасываем флаг throttle через короткий промежуток времени
            setTimeout(() => {
                window.dragOverThrottled = false;
            }, 30); // 30мс оптимально для плавного отображения
        }
        
        return false;
    }
    
    // Обработчик ухода из зоны перетаскивания
    function handleDragLeave(e) {
        // Улучшенная обработка для предотвращения мерцания
        // Проверяем, что мышь действительно покинула элемент, а не перешла на дочерний элемент
        const rect = e.target.getBoundingClientRect();
        const isLeaving = 
            e.clientX <= rect.left || 
            e.clientX >= rect.right || 
            e.clientY <= rect.top || 
            e.clientY >= rect.bottom;

        if (isLeaving) {
            // Удаляем индикаторы с текущего элемента
            if (e.target.classList.contains('drag-over') || 
                e.target.classList.contains('drag-over-top') || 
                e.target.classList.contains('drag-over-bottom')) {
                e.target.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
            }
            
            if (e.target.closest('.folder-items')) {
                const folderItems = e.target.closest('.folder-items');
                
                // Проверяем, что курсор действительно вышел за пределы папки
                const folderRect = folderItems.getBoundingClientRect();
                if (e.clientX <= folderRect.left || 
                    e.clientX >= folderRect.right || 
                    e.clientY <= folderRect.top || 
                    e.clientY >= folderRect.bottom) {
                    folderItems.classList.remove('drag-over');
                }
            }
        }
    }
    
    // Упрощенная функция обработки бросания элемента
    function handleDrop(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        // Если бросание не на перетаскиваемый элемент и draggedItem существует
        if (draggedItem && draggedItem !== e.target) {
            // Восстанавливаем прозрачность
            draggedItem.style.opacity = '1';
            
            // Если бросаем в контейнер папки
            if (e.target.closest('.folder-items')) {
                const folderItems = e.target.closest('.folder-items');
                
                // Проверка: не перетаскиваем ли элемент внутрь себя или своего потомка
                const targetFolderItem = folderItems.closest('.folder-item');
                if (draggedItem.contains(targetFolderItem)) {
                    showMessage('Нельзя переместить элемент внутрь себя или своего потомка', 'error');
                    return false;
                }
                
                // Удаляем сообщение о пустой папке, если оно есть
                const emptyFolders = folderItems.querySelectorAll('.empty-folder');
                emptyFolders.forEach(emptyFolder => {
                    if (emptyFolder.parentNode === folderItems) {
                        folderItems.removeChild(emptyFolder);
                    }
                });
                
                // Перемещаем элемент в конец папки
                folderItems.appendChild(draggedItem);
                
                // Если папка была свернута, разворачиваем ее
                const parentFolder = folderItems.closest('.folder-item');
                if (parentFolder && parentFolder.classList.contains('folder-collapsed')) {
                    parentFolder.classList.remove('folder-collapsed');
                }
                
                // Воспроизводим звук перемещения
                playDropSound();
            } else {
                // Если бросаем на файл или папку
                const targetItem = e.target.closest('.file-item, .folder-item');
                
                if (targetItem && targetItem !== draggedItem) {
                    // Проверка: не перетаскиваем ли элемент относительно своего потомка
                    if (draggedItem.contains(targetItem)) {
                        showMessage('Нельзя переместить элемент относительно своего потомка', 'error');
                        return false;
                    }
                    
                    const parent = targetItem.parentNode;
                    
                    if (targetItem.classList.contains('drag-over-top')) {
                        // Вставляем перед элементом
                        parent.insertBefore(draggedItem, targetItem);
                    } else if (targetItem.classList.contains('drag-over-bottom')) {
                        // Вставляем после элемента
                        parent.insertBefore(draggedItem, targetItem.nextSibling);
                    }
                    
                    // Воспроизводим звук перемещения
                    playDropSound();
                }
            }
            
            // Обновляем состояние пустых папок
            setTimeout(updateEmptyFolderState, 100);
        }
        
        // Очищаем все индикаторы перетаскивания
        clearDragIndicators();
        
        return false;
    }
    
    // Функция воспроизведения звука перемещения
    function playDropSound() {
        // Создаем временный HTML5 аудио элемент
        const audio = new Audio();
        audio.volume = 0.2; // Уменьшаем громкость
        audio.src = 'data:audio/mp3;base64,SUQzAwAAAAABElRJVDIAAABpAAAAAAAAAExBTUUzLjEwMABUUkNLAAAAAgAAAFRZRVIAAAAFAAAAMjAyMwBUQ09OAAAADgAAAFNvdW5kIEVmZmVjdABUUEUxAAAADAAAAFN3aXNoIHNvdW5kAP/7kGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEluZm8AAAAPAAAABQAAAyAAAQMGCg0QExYZHB8iJSgrLjE0Nzo9QENGSU1QU1ZZXGBjZmltcHN2eX2AhImMj5KVmJueoaSoq66xtLe6vcDDxsjLztHU19rd4OPm6ezt8PP29/n8//8AAAAALQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//vQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/70GQAg/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+9BkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
        
        // Воспроизводим звук
        audio.play().catch(e => {
            // Игнорируем ошибки воспроизведения, если браузер не поддерживает автовоспроизведение
            console.log("Sound playback was prevented: ", e);
        });
    }
    
    // Обработчик окончания перетаскивания
    function handleDragEnd(e) {
        // Восстанавливаем прозрачность
        if (draggedItem) {
            draggedItem.style.opacity = '1';
            
            // Плавно удаляем класс dragging
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
        
        // Очищаем все индикаторы перетаскивания
        clearDragIndicators();
        
        // Сбрасываем целевой контейнер
        dragTargetContainer = null;
    }
    
    // Очистка всех индикаторов перетаскивания
    function clearDragIndicators() {
        // Удаляем классы со всех элементов
        document.querySelectorAll('.drag-over, .drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        });
    }
    
    // Обновление состояния пустых папок
    function updateEmptyFolderState() {
        // Проверяем все контейнеры папок
        document.querySelectorAll('.folder-items').forEach(folderItems => {
            // Ищем реальные элементы структуры (папки и файлы), исключая служебные
            const hasItems = Array.from(folderItems.children).some(child => 
                child.classList && (child.classList.contains('folder-item') || child.classList.contains('file-item'))
            );
            
            // Если нет элементов и нет сообщения о пустой папке, добавляем его
            if (!hasItems && !folderItems.querySelector('.empty-folder')) {
                const emptyFolder = document.createElement('div');
                emptyFolder.className = 'empty-folder';
                emptyFolder.textContent = 'Эта папка пуста. Добавьте файлы или подпапки.';
                folderItems.appendChild(emptyFolder);
            }
        });
        
        // Также проверяем основной контейнер
        checkEmptyStructure();
    }
    
    // Функция загрузки списка проектов
    function loadProjects() {
        fetch('/api/projects')
            .then(response => response.json())
            .then(data => {
                // Очистка списка проектов
                while (projectSelect.options.length > 1) {
                    projectSelect.remove(1);
                }
                
                // Добавление проектов в список
                data.projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name;
                    projectSelect.appendChild(option);
                });
                
                // Проверка на пустую структуру
                checkEmptyStructure();
            })
            .catch(error => {
                showMessage('Ошибка загрузки проектов: ' + error.message, 'error');
            });
    }
    
    // Функция загрузки выбранного проекта
    function loadSelectedProject() {
        const selectedId = projectSelect.value;
        
        if (selectedId === 'new') {
            // Очистка формы для нового проекта
            projectNameInput.value = '';
            projectIdInput.value = '';
            structureContainer.innerHTML = '';
            checkEmptyStructure();
            return;
        }
        
        fetch(`/api/projects/${selectedId}`)
            .then(response => response.json())
            .then(project => {
                projectNameInput.value = project.name;
                projectIdInput.value = project.id;
                
                // Очистка контейнера структуры
                structureContainer.innerHTML = '';
                
                // Загрузка структуры проекта
                if (project.structure && Array.isArray(project.structure)) {
                    loadProjectStructure(project.structure, structureContainer);
                } else if (project.files && Array.isArray(project.files)) {
                    // Поддержка старого формата для обратной совместимости
                    project.files.forEach(fileData => {
                        const fileItem = addFileWithData(structureContainer, fileData);
                    });
                }
                
                // Проверка на пустую структуру
                checkEmptyStructure();
            })
            .catch(error => {
                showMessage('Ошибка загрузки проекта: ' + error.message, 'error');
            });
    }
    
    // Функция для загрузки структуры проекта (рекурсивная)
    function loadProjectStructure(items, container) {
        items.forEach(item => {
            if (item.type === 'folder') {
                const folderElement = addFolderWithData(container, item);
                const folderContent = folderElement.querySelector('.folder-items');
                
                // Удаляем сообщение о пустой папке, если есть дочерние элементы
                if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                    const emptyFolder = folderContent.querySelector('.empty-folder');
                    if (emptyFolder) {
                        folderContent.removeChild(emptyFolder);
                    }
                    loadProjectStructure(item.children, folderContent);
                }
            } else if (item.type === 'file') {
                addFileWithData(container, item);
            }
        });
    }
    
    // Функция удаления выбранного проекта
    function deleteSelectedProject() {
        const selectedId = projectSelect.value;
        
        if (selectedId === 'new') {
            showMessage('Нет выбранного проекта для удаления', 'error');
            return;
        }
        
        if (!confirm('Вы действительно хотите удалить этот проект?')) {
            return;
        }
        
        fetch(`/api/projects/${selectedId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Проект успешно удален', 'success');
                    loadProjects();
                    projectSelect.value = 'new';
                    loadSelectedProject();
                } else {
                    showMessage('Ошибка при удалении проекта', 'error');
                }
            })
            .catch(error => {
                showMessage('Ошибка удаления проекта: ' + error.message, 'error');
            });
    }
    
    // Функция добавления новой папки
    function addFolder(container) {
        // Удаляем сообщение о пустой структуре, если оно есть
        if (container === structureContainer) {
            const emptyState = container.querySelector('#empty-structure');
            if (emptyState && emptyState.style.display !== 'none') {
                emptyState.style.display = 'none';
            }
        }
        
        const folderElement = document.importNode(folderTemplate.content, true);
        const folderItem = folderElement.querySelector('.folder-item');
        
        setupFolderEventHandlers(folderItem);
        
        // Проверяем наличие пустого состояния папки и удаляем его
        if (container.querySelector('.empty-folder')) {
            // Преобразуем коллекцию в массив для безопасного удаления
            const emptyFolders = Array.from(container.querySelectorAll('.empty-folder'));
            emptyFolders.forEach(emptyFolder => {
                if (emptyFolder.parentNode === container) { // Дополнительная проверка
                    container.removeChild(emptyFolder);
                }
            });
        }
        
        container.appendChild(folderItem);
        
        // Обновляем глобальный статус структуры
        if (container === structureContainer) {
            checkEmptyStructure();
        }
        
        return folderItem;
    }
    
    // Функция добавления папки с данными
    function addFolderWithData(container, folderData) {
        const folderItem = addFolder(container);
        folderItem.querySelector('.folder-name').value = folderData.name || '';
        
        // Обновляем заголовок папки
        const folderName = folderData.name || '';
        if (folderName) {
            folderItem.querySelector('.folder-header h3').textContent = `Папка: ${folderName}`;
        }
        
        return folderItem;
    }
    
    // Функция настройки обработчиков событий для папки
    function setupFolderEventHandlers(folderItem) {
        // Кнопка удаления
        const removeBtn = folderItem.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', function() {
            const parent = folderItem.parentNode;
            parent.removeChild(folderItem);
            
            // Если после удаления папка пуста, добавляем сообщение о пустой папке
            // Проверяем, есть ли в родительском контейнере какие-либо файлы или папки
            const hasItems = Array.from(parent.children).some(child => 
                child.classList && (child.classList.contains('folder-item') || child.classList.contains('file-item'))
            );
            
            // Если нет элементов и это контейнер внутри папки, добавляем сообщение о пустой папке
            if (!hasItems && parent.classList.contains('folder-items')) {
                // Убедимся, что нет существующего сообщения о пустой папке
                if (!parent.querySelector('.empty-folder')) {
                    const emptyFolder = document.createElement('div');
                    emptyFolder.className = 'empty-folder';
                    emptyFolder.textContent = 'Эта папка пуста. Добавьте файлы или подпапки.';
                    parent.appendChild(emptyFolder);
                }
            }
            
            checkEmptyStructure();
        });
        
        // Кнопка сворачивания/разворачивания
        const toggleBtn = folderItem.querySelector('.toggle-folder-btn');
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Предотвращаем всплытие события
            toggleFolderCollapse(folderItem);
        });
        
        // Добавляем клик на весь заголовок для сворачивания/разворачивания
        const folderHeader = folderItem.querySelector('.folder-header');
        folderHeader.addEventListener('click', function(e) {
            // Проверяем, что клик не был на кнопках
            if (!e.target.closest('.item-actions button')) {
                toggleFolderCollapse(folderItem);
            }
        });
        
        // Кнопки добавления в папку
        const addFolderInFolderBtn = folderItem.querySelector('.add-folder-in-folder-btn');
        const addFileInFolderBtn = folderItem.querySelector('.add-file-in-folder-btn');
        const folderItemsContainer = folderItem.querySelector('.folder-items');
        
        if (addFolderInFolderBtn) {
            addFolderInFolderBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Добавление подпапки');
                const newFolder = addFolder(folderItemsContainer);
                // Разворачиваем родительскую папку, если она свёрнута
                if (folderItem.classList.contains('folder-collapsed')) {
                    folderItem.classList.remove('folder-collapsed');
                }
            });
        }
        
        if (addFileInFolderBtn) {
            addFileInFolderBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Добавление файла в папку');
                const newFile = addFile(folderItemsContainer);
                // Разворачиваем родительскую папку, если она свёрнута
                if (folderItem.classList.contains('folder-collapsed')) {
                    folderItem.classList.remove('folder-collapsed');
                }
            });
        }
        
        // Обновление имени папки в заголовке при вводе
        const folderNameInput = folderItem.querySelector('.folder-name');
        const folderHeaderTitle = folderItem.querySelector('.folder-header h3');
        
        // Функция обновления заголовка
        function updateFolderHeader() {
            const folderName = folderNameInput.value.trim();
            if (folderName) {
                folderHeaderTitle.textContent = `Папка: ${folderName}`;
            } else {
                folderHeaderTitle.textContent = 'Папка';
            }
        }
        
        // Слушатель для обновления заголовка при вводе
        folderNameInput.addEventListener('input', updateFolderHeader);
        folderNameInput.addEventListener('change', updateFolderHeader);
        
        // Вызываем функцию сразу, чтобы установить начальное значение
        updateFolderHeader();
    }
    
    // Функция для сворачивания/разворачивания папки
    function toggleFolderCollapse(folderItem) {
        folderItem.classList.toggle('folder-collapsed');
    }
    
    // Функция добавления нового файла
    function addFile(container) {
        // Удаляем сообщение о пустой структуре, если оно есть
        if (container === structureContainer) {
            const emptyState = container.querySelector('#empty-structure');
            if (emptyState && emptyState.style.display !== 'none') {
                emptyState.style.display = 'none';
            }
        }
        
        const fileElement = document.importNode(fileTemplate.content, true);
        const fileItem = fileElement.querySelector('.file-item');
        
        // Добавляем класс свёрнутого файла по умолчанию
        fileItem.classList.add('file-collapsed');
        
        setupFileEventHandlers(fileItem);
        
        // Проверяем наличие пустого состояния папки и удаляем его
        if (container.querySelector('.empty-folder')) {
            // Преобразуем коллекцию в массив для безопасного удаления
            const emptyFolders = Array.from(container.querySelectorAll('.empty-folder'));
            emptyFolders.forEach(emptyFolder => {
                if (emptyFolder.parentNode === container) { // Дополнительная проверка
                    container.removeChild(emptyFolder);
                }
            });
        }
        
        container.appendChild(fileItem);
        
        // Обновляем глобальный статус структуры
        if (container === structureContainer) {
            checkEmptyStructure();
        }
        
        return fileItem;
    }
    
    // Функция добавления файла с данными
    function addFileWithData(container, fileData) {
        const fileItem = addFile(container);
        fileItem.querySelector('.file-name').value = fileData.file_name || '';
        fileItem.querySelector('.file-description').value = fileData.description || '';
        
        // Добавляем класс свёрнутого файла по умолчанию
        fileItem.classList.add('file-collapsed');
        
        // Обработка пар ввод-вывод
        const ioPairsContainer = fileItem.querySelector('.io-pairs');
        // Удаляем первую пустую пару, которая создалась автоматически
        ioPairsContainer.innerHTML = '';
        
        if (fileData.io_pairs && Array.isArray(fileData.io_pairs)) {
            // Если существует массив пар, добавляем каждую из них
            fileData.io_pairs.forEach((pairData, index) => {
                addPairWithData(ioPairsContainer, pairData, index + 1);
            });
        } else if (fileData.input_mocks && fileData.output_mocks && 
                   Array.isArray(fileData.input_mocks) && Array.isArray(fileData.output_mocks)) {
            // Обратная совместимость с раздельными массивами входных и выходных данных
            const maxPairs = Math.max(fileData.input_mocks.length, fileData.output_mocks.length);
            
            for (let i = 0; i < maxPairs; i++) {
                const pairData = {
                    input: fileData.input_mocks[i] || {},
                    output: fileData.output_mocks[i] || {}
                };
                addPairWithData(ioPairsContainer, pairData, i + 1);
            }
        } else if (fileData.input_mock || fileData.output_mock) {
            // Обратная совместимость с одиночными моками
            const pairData = {
                input: fileData.input_mock || {},
                output: fileData.output_mock || {}
            };
            addPairWithData(ioPairsContainer, pairData, 1);
        } else {
            // Если нет моков, добавляем пустую пару
            addPair(ioPairsContainer);
        }
        
        // Обновляем заголовок файла
        updateFileHeaderInfo(fileItem);
        
        return fileItem;
    }
    
    // Функция добавления пары с данными
    function addPairWithData(container, pairData, index) {
        const pairItem = document.createElement('div');
        pairItem.className = 'mock-pair';
        
        pairItem.innerHTML = `
            <div class="mock-header">
                <div class="mock-header-actions">
                    <button type="button" class="remove-pair-btn btn-icon">✖</button>
                </div>
            </div>
            <div class="mock-io-container">
                <div class="mock-io-item">
                    <label>Вход:</label>
                    <textarea class="file-input-mock">${formatJsonData(pairData.input)}</textarea>
                </div>
                <div class="mock-io-arrow">→</div>
                <div class="mock-io-item">
                    <label>Выход:</label>
                    <textarea class="file-output-mock">${formatJsonData(pairData.output)}</textarea>
                </div>
            </div>
        `;
        
        container.appendChild(pairItem);
        
        // Подключение обработчика для кнопки удаления
        const removeBtn = pairItem.querySelector('.remove-pair-btn');
        removeBtn.addEventListener('click', function() {
            if (container.querySelectorAll('.mock-pair').length <= 1) return;
            container.removeChild(pairItem);
        });
        
        // Валидация JSON в текстовых полях
        pairItem.querySelectorAll('.file-input-mock, .file-output-mock').forEach(textarea => {
            textarea.addEventListener('blur', function() {
                validateJson(this);
            });
        });
        
        return pairItem;
    }
    
    // Форматирование данных JSON
    function formatJsonData(data) {
        if (!data) return '';
        
        try {
            if (typeof data === 'string') {
                return data;
            } else {
                return JSON.stringify(data, null, 2);
            }
        } catch (e) {
            return JSON.stringify({});
        }
    }
    
    // Функция добавления новой пары
    function addPair(container) {
        const pairCount = container.querySelectorAll('.mock-pair').length + 1;
        const pairItem = addPairWithData(container, { input: {}, output: {} }, pairCount);
        
        // Обновляем заголовок файла, если добавление пары было успешным
        const fileItem = container.closest('.file-item');
        if (fileItem) {
            updateFileHeaderInfo(fileItem);
        }
        
        return pairItem;
    }
    
    // Функция обновления нумерации вариантов
    function updatePairNumbers(container) {
        // Функция больше не требуется, так как нумерация удалена
    }
    
    // Функция валидации JSON
    function validateJson(element) {
        const text = element.value.trim();
        
        if (!text) return; // Пустое поле допустимо
        
        try {
            const parsed = JSON.parse(text);
            
            // Форматируем JSON и обновляем текстовое поле
            element.value = JSON.stringify(parsed, null, 2);
            
            // Убираем класс ошибки, если он был
            element.classList.remove('error');
        } catch (e) {
            // Устанавливаем класс ошибки
            element.classList.add('error');
            
            // Показываем сообщение об ошибке в консоли
            console.error(`Ошибка JSON в поле: ${e.message}`);
        }
    }
    
    // Функция обновления заголовка файла
    function updateFileHeaderInfo(fileItem) {
        const fileNameInput = fileItem.querySelector('.file-name');
        const fileHeaderTitle = fileItem.querySelector('.file-header h3');
        
        const fileName = fileNameInput.value.trim();
        
        let headerText = 'Файл';
        if (fileName) {
            headerText = `Файл: ${fileName}`;
        }
        
        fileHeaderTitle.textContent = headerText;
    }
    
    // Функция настройки обработчиков событий для файла
    function setupFileEventHandlers(fileItem) {
        // Кнопка удаления
        const removeBtn = fileItem.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', function() {
            const parent = fileItem.parentNode;
            parent.removeChild(fileItem);
            
            // Проверяем, есть ли в родительском контейнере какие-либо файлы или папки
            const hasItems = Array.from(parent.children).some(child => 
                child.classList && (child.classList.contains('folder-item') || child.classList.contains('file-item'))
            );
            
            // Если нет элементов и это контейнер внутри папки, добавляем сообщение о пустой папке
            if (!hasItems && parent.classList.contains('folder-items')) {
                // Убедимся, что нет существующего сообщения о пустой папке
                if (!parent.querySelector('.empty-folder')) {
                    const emptyFolder = document.createElement('div');
                    emptyFolder.className = 'empty-folder';
                    emptyFolder.textContent = 'Эта папка пуста. Добавьте файлы или подпапки.';
                    parent.appendChild(emptyFolder);
                }
            }
            
            checkEmptyStructure();
        });
        
        // Кнопка для сворачивания/разворачивания файла
        const toggleBtn = fileItem.querySelector('.toggle-file-btn');
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Предотвращаем всплытие события
            toggleFileCollapse(fileItem);
        });
        
        // Добавляем клик на весь заголовок для сворачивания/разворачивания
        const fileHeaderElement = fileItem.querySelector('.file-header');
        fileHeaderElement.addEventListener('click', function(e) {
            // Проверяем, что клик не был на кнопках
            if (!e.target.closest('.item-actions button')) {
                toggleFileCollapse(fileItem);
            }
        });
        
        // Кнопка добавления новой пары
        const addPairBtn = fileItem.querySelector('.add-pair-btn');
        const ioPairsContainer = fileItem.querySelector('.io-pairs');
        
        addPairBtn.addEventListener('click', function() {
            addPair(ioPairsContainer);
            updateFileHeaderInfo(fileItem);
        });
        
        // Подключение обработчиков для кнопок удаления пар
        const removePairBtns = fileItem.querySelectorAll('.remove-pair-btn');
        removePairBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const pairItem = this.closest('.mock-pair');
                const pairsContainer = pairItem.parentNode;
                
                // Если это единственная пара, не удаляем её
                if (pairsContainer.querySelectorAll('.mock-pair').length <= 1) {
                    return;
                }
                
                pairsContainer.removeChild(pairItem);
                
                // Обновляем заголовок с новым количеством пар
                updateFileHeaderInfo(fileItem);
            });
        });
        
        // Валидация JSON в текстовых полях
        fileItem.querySelectorAll('.file-input-mock, .file-output-mock').forEach(textarea => {
            textarea.addEventListener('blur', function() {
                validateJson(this);
            });
        });
        
        // Обновление имени файла в заголовке при вводе
        const fileNameInput = fileItem.querySelector('.file-name');
        
        // Слушатель для обновления заголовка при вводе
        fileNameInput.addEventListener('input', function() {
            updateFileHeaderInfo(fileItem);
        });
        fileNameInput.addEventListener('change', function() {
            updateFileHeaderInfo(fileItem);
        });
        
        // Вызываем функцию сразу, чтобы установить начальное значение
        updateFileHeaderInfo(fileItem);
    }
    
    // Функция для сворачивания/разворачивания файла
    function toggleFileCollapse(fileItem) {
        fileItem.classList.toggle('file-collapsed');
    }
    
    // Функция сбора структуры проекта
    function collectProjectStructure(container) {
        const items = [];
        
        container.childNodes.forEach(element => {
            // Пропускаем текстовые узлы и элемент пустого состояния
            if (element.nodeType !== Node.ELEMENT_NODE || element.id === 'empty-structure' || element.classList.contains('empty-folder')) {
                return;
            }
            
            if (element.classList.contains('file-item')) {
                const fileItem = {
                    type: 'file',
                    file_name: element.querySelector('.file-name').value,
                    description: element.querySelector('.file-description').value
                };
                
                // Получение пар ввод-вывод
                const ioPairs = [];
                element.querySelectorAll('.io-pairs .mock-pair').forEach(pairItem => {
                    const inputMock = pairItem.querySelector('.file-input-mock');
                    const outputMock = pairItem.querySelector('.file-output-mock');
                    
                    const inputText = inputMock.value.trim();
                    const outputText = outputMock.value.trim();
                    
                    const pairData = {};
                    
                    if (inputText) {
                        try {
                            pairData.input = JSON.parse(inputText);
                        } catch (e) {
                            // Если данные не в формате JSON, сохраняем как строку
                            pairData.input = inputText;
                        }
                    }
                    
                    if (outputText) {
                        try {
                            pairData.output = JSON.parse(outputText);
                        } catch (e) {
                            // Если данные не в формате JSON, сохраняем как строку
                            pairData.output = outputText;
                        }
                    }
                    
                    if (Object.keys(pairData).length > 0) {
                        ioPairs.push(pairData);
                    }
                });
                
                if (ioPairs.length > 0) {
                    fileItem.io_pairs = ioPairs;
                    
                    // Для обратной совместимости
                    if (ioPairs[0].input) {
                        fileItem.input_mock = ioPairs[0].input;
                    }
                    if (ioPairs[0].output) {
                        fileItem.output_mock = ioPairs[0].output;
                    }
                    
                    // Еще для обратной совместимости отдельные массивы
                    fileItem.input_mocks = ioPairs.map(pair => pair.input).filter(Boolean);
                    fileItem.output_mocks = ioPairs.map(pair => pair.output).filter(Boolean);
                }
                
                items.push(fileItem);
            } else if (element.classList.contains('folder-item')) {
                const folderItem = {
                    type: 'folder',
                    name: element.querySelector('.folder-name').value,
                    children: []
                };
                
                // Рекурсивно получаем содержимое папки
                const folderContent = element.querySelector('.folder-items');
                folderItem.children = collectProjectStructure(folderContent);
                
                items.push(folderItem);
            }
        });
        
        return items;
    }
    
    // Функция сохранения проекта
    function saveProject() {
        const projectName = projectNameInput.value.trim();
        const projectId = projectIdInput.value.trim();
        
        if (!projectName) {
            showMessage('Укажите название проекта', 'error');
            projectNameInput.focus();
            return;
        }
        
        // Проверка на валидность всех JSON полей
        const invalidJsonFields = document.querySelectorAll('textarea.file-input-mock.error, textarea.file-output-mock.error');
        if (invalidJsonFields.length > 0) {
            showMessage('Проверьте корректность формата JSON во всех полях', 'error');
            invalidJsonFields[0].focus();
            return;
        }
        
        // Проверка на заполненность имен файлов (только если нужно)
        const fileInputs = document.querySelectorAll('.file-item .file-name');
        const emptyFileNames = Array.from(fileInputs).filter(input => !input.value.trim());
        if (emptyFileNames.length > 0) {
            showMessage('Укажите имена для всех файлов', 'error');
            emptyFileNames[0].focus();
            return;
        }
        
        // Проверка на заполненность имен папок (только если нужно)
        const folderInputs = document.querySelectorAll('.folder-item .folder-name');
        const emptyFolderNames = Array.from(folderInputs).filter(input => !input.value.trim());
        if (emptyFolderNames.length > 0) {
            showMessage('Укажите имена для всех папок', 'error');
            emptyFolderNames[0].focus();
            return;
        }
        
        // Собираем структуру проекта
        const projectStructure = collectProjectStructure(structureContainer);
        
        const projectData = {
            name: projectName,
            structure: projectStructure
        };
        
        if (projectId) {
            projectData.id = projectId;
        }
        
        // Сохраняем проект через API
        fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Проект успешно сохранен', 'success');
                    
                    // Обновляем ID проекта в скрытом поле
                    projectIdInput.value = data.project.id;
                    
                    // Обновляем список проектов
                    loadProjects();
                    
                    // Выбираем сохраненный проект в списке
                    setTimeout(() => {
                        projectSelect.value = data.project.id;
                    }, 500);
                } else {
                    showMessage('Ошибка при сохранении проекта', 'error');
                }
            })
            .catch(error => {
                showMessage('Ошибка сохранения проекта: ' + error.message, 'error');
            });
    }
    
    // Функция экспорта проекта в JSON файл
    function exportProjectJson() {
        const projectName = projectNameInput.value.trim();
        
        if (!projectName) {
            showMessage('Укажите название проекта перед экспортом', 'error');
            projectNameInput.focus();
            return;
        }
        
        // Проверка на валидность всех JSON полей
        const invalidJsonFields = document.querySelectorAll('textarea.file-input-mock.error, textarea.file-output-mock.error');
        if (invalidJsonFields.length > 0) {
            showMessage('Проверьте корректность формата JSON во всех полях перед экспортом', 'error');
            invalidJsonFields[0].focus();
            return;
        }
        
        // Собираем структуру проекта
        const projectStructure = collectProjectStructure(structureContainer);
        
        const projectData = {
            name: projectName,
            structure: projectStructure
        };
        
        // Добавляем ID проекта, если он существует
        const projectId = projectIdInput.value.trim();
        if (projectId) {
            projectData.id = projectId;
        }
        
        // Создаем Blob с данными JSON
        const jsonData = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // Создаем ссылку для скачивания
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${projectName.replace(/\s+/g, '_')}_project.json`;
        
        // Добавляем ссылку в DOM, нажимаем на неё и удаляем
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        showMessage('Проект успешно экспортирован в JSON файл', 'success');
    }
    
    // Усовершенствованная функция отображения сообщений
    function showMessage(message, type, duration = 5000) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.classList.add('active');
        
        // Автоматическое скрытие сообщения
        const timeout = setTimeout(() => {
            statusMessage.classList.remove('active');
            
            // Очистка сообщения после анимации
            setTimeout(() => {
                statusMessage.textContent = '';
                statusMessage.className = '';
            }, 400);
        }, duration);
        
        // Сохраняем timeout ID в элементе, чтобы иметь возможность отменить его
        statusMessage.dataset.timeoutId = timeout;
    }
    
    // Проверка на пустую структуру при загрузке
    checkEmptyStructure();
    
    // Добавление начальной папки или файла для нового проекта
    if (projectSelect.value === 'new' && structureContainer.children.length === 0) {
        emptyStructure.style.display = 'block';
    }
    
    // Функции для работы с модальным окном ввода JSON
    function openJsonModal() {
        jsonModal.classList.add('active');
        // Предзаполним поле ввода актуальной структурой проекта, если она есть
        if (projectNameInput.value.trim()) {
            const projectStructure = collectProjectStructure(structureContainer);
            const projectData = {
                name: projectNameInput.value.trim(),
                structure: projectStructure
            };
            
            // Добавляем ID проекта, если он существует
            const projectId = projectIdInput.value.trim();
            if (projectId) {
                projectData.id = projectId;
            }
            
            jsonInput.value = JSON.stringify(projectData, null, 2);
        } else {
            jsonInput.value = '{\n  "name": "Название проекта",\n  "structure": [\n    \n  ]\n}';
        }
        
        // Установка фокуса на текстовое поле с небольшой задержкой
        setTimeout(() => {
            jsonInput.focus();
        }, 300);
    }
    
    function closeJsonModal() {
        jsonModal.classList.remove('active');
    }
    
    function applyManualJson() {
        const jsonText = jsonInput.value.trim();
        
        if (!jsonText) {
            showMessage('Введите JSON структуру', 'error');
            return;
        }
        
        try {
            const jsonData = JSON.parse(jsonText);
            
            // Проверка валидности структуры
            if (!jsonData) {
                throw new Error('Данные не содержат структуры');
            }
            
            // Очистка текущей структуры проекта
            structureContainer.innerHTML = '';
            
            // Если есть название проекта, устанавливаем его
            if (jsonData.name) {
                projectNameInput.value = jsonData.name;
            }
            
            // Если есть ID проекта, устанавливаем его
            if (jsonData.id) {
                projectIdInput.value = jsonData.id;
            } else {
                // Сбрасываем ID для создания нового проекта
                projectIdInput.value = '';
            }
            
            // Загрузка структуры из разных форматов
            if (jsonData.structure && Array.isArray(jsonData.structure)) {
                // Новый формат с массивом структуры
                loadProjectStructure(jsonData.structure, structureContainer);
            } else if (jsonData.files && Array.isArray(jsonData.files)) {
                // Старый формат с массивом файлов
                jsonData.files.forEach(fileData => {
                    addFileWithData(structureContainer, fileData);
                });
            } else if (Array.isArray(jsonData)) {
                // Простой массив элементов структуры
                loadProjectStructure(jsonData, structureContainer);
            } else {
                throw new Error('Неподдерживаемый формат JSON');
            }
            
            // Проверка пустой структуры
            checkEmptyStructure();
            
            // Выбираем опцию "Новый проект" в списке
            projectSelect.value = 'new';
            
            showMessage('Структура проекта успешно импортирована', 'success');
            
            // Закрываем модальное окно
            closeJsonModal();
            
        } catch (error) {
            showMessage('Ошибка в формате JSON: ' + error.message, 'error');
            console.error('Ошибка обработки JSON:', error);
        }
    }
    
    // Функция для открытия модального окна отображения дерева
    function openTreeModal() {
        treeModal.classList.add('active');
        updateTreeView();
    }
    
    // Закрытие модального окна дерева
    function closeTreeModal() {
        treeModal.classList.remove('active');
    }
    
    // Обновление отображения дерева файлов
    function updateTreeView() {
        // Проверяем, существует ли элемент treeOutput
        if (!treeOutput) return;
        
        // Получаем структуру проекта
        const projectStructure = collectProjectStructure(structureContainer);
        
        // Генерируем отображение дерева в формате Unicode
        const treeContent = generateUnicodeTree(projectStructure);
        
        // Отображаем дерево
        treeOutput.innerHTML = treeContent;
    }
    
    // Генерация Unicode-дерева файлов (с красивыми символами)
    function generateUnicodeTree(items, prefix = '', isLast = true, rootName = projectNameInput.value.trim() || 'project', path = []) {
        let currentPath = [...path];
        if (prefix) {
            // Для вложенных элементов добавляем имя текущей папки в путь
            currentPath.push(rootName);
        }
        
        // Создаем строку для корневого элемента (папка проекта)
        let result = '';
        if (prefix) {
            // Для вложенных папок добавляем префикс и имя
            result = `<div class="tree-line">${prefix}${isLast ? '└─ ' : '├─ '}<span class="tree-folder" data-path="${currentPath.join('/')}">${rootName}/</span><div class="tree-actions"><button class="tree-add-file" data-path="${currentPath.join('/')}">+Ф</button><button class="tree-add-folder" data-path="${currentPath.join('/')}">+П</button></div></div>\n`;
        } else {
            // Для корневой папки проекта
            result = `<div class="tree-line"><span class="tree-folder" data-path="root">${rootName}/</span><div class="tree-actions"><button class="tree-add-file" data-path="root">+Ф</button><button class="tree-add-folder" data-path="root">+П</button></div></div>\n`;
        }
        
        if (!items || !items.length) {
            return result;
        }
        
        items.forEach((item, index) => {
            const isLastItem = index === items.length - 1;
            const newPrefix = prefix + (isLast ? '   ' : '│  ');
            
            if (item.type === 'folder') {
                result += generateUnicodeTree(
                    item.children || [], 
                    newPrefix, 
                    isLastItem,
                    item.name,
                    currentPath
                );
            } else if (item.type === 'file') {
                result += `<div class="tree-line">${newPrefix}${isLastItem ? '└─ ' : '├─ '}<span class="tree-file" data-path="${[...currentPath, item.file_name].join('/')}">${item.file_name}</span><div class="tree-actions"><button class="tree-view-file" data-path="${[...currentPath, item.file_name].join('/')}">👁️</button></div></div>\n`;
            }
        });
        
        return result;
    }
    
    // Функция для обработки интерактивных элементов дерева
    function handleTreeInteraction(e) {
        // Обработка нажатия на кнопку добавления файла
        if (e.target.classList.contains('tree-add-file')) {
            const path = e.target.getAttribute('data-path');
            addFileToPath(path);
            return;
        }
        
        // Обработка нажатия на кнопку добавления папки
        if (e.target.classList.contains('tree-add-folder')) {
            const path = e.target.getAttribute('data-path');
            addFolderToPath(path);
            return;
        }
        
        // Обработка нажатия на кнопку просмотра файла
        if (e.target.classList.contains('tree-view-file')) {
            const path = e.target.getAttribute('data-path');
            viewFileByPath(path);
            return;
        }
        
        // Обработка нажатия на файл (открытие)
        if (e.target.classList.contains('tree-file')) {
            const path = e.target.getAttribute('data-path');
            openFileByPath(path);
            return;
        }
        
        // Обработка нажатия на папку (открытие/закрытие)
        if (e.target.classList.contains('tree-folder')) {
            const path = e.target.getAttribute('data-path');
            toggleFolderByPath(path);
            return;
        }
    }
    
    // Функция для просмотра файла в модальном окне
    function viewFileByPath(path) {
        // Создаем модальное окно, если его нет
        if (!createFileEditModalIfNeeded()) {
            console.error("Не удалось создать модальное окно редактирования файла");
            return;
        }
        
        // Разбиваем путь на части
        const pathParts = path.split('/');
        const fileName = pathParts.pop(); // Последняя часть - имя файла
        
        // Находим файл
        let fileElement = null;
        
        if (pathParts.length === 0) {
            // Файл в корневом каталоге
            const files = structureContainer.querySelectorAll('.file-item');
            for (const file of files) {
                const nameInput = file.querySelector('.file-name');
                if (nameInput && nameInput.value === fileName) {
                    fileElement = file;
                    break;
                }
            }
        } else {
            // Файл внутри папки
            const folderContainer = findFolderByPath(pathParts);
            if (folderContainer) {
                const folderItems = folderContainer.querySelector('.folder-items');
                if (folderItems) {
                    const files = folderItems.querySelectorAll('.file-item');
                    for (const file of files) {
                        const nameInput = file.querySelector('.file-name');
                        if (nameInput && nameInput.value === fileName) {
                            fileElement = file;
                            break;
                        }
                    }
                }
            }
        }
        
        // Открываем модальное окно с информацией о файле
        if (fileElement) {
            openFileEditModal(fileElement);
        } else {
            console.error(`Файл "${fileName}" не найден в пути ${path}`);
        }
    }
    
    // Функция для добавления файла по указанному пути
    function addFileToPath(path) {
        let container;
        
        if (path === 'root') {
            // Добавление в корневой каталог
            container = structureContainer;
        } else {
            // Разбиваем путь на части
            const pathParts = path.split('/');
            
            // Находим соответствующий контейнер папки
            container = findFolderByPath(pathParts);
        }
        
        if (container) {
            // Если это корневой контейнер
            if (container === structureContainer) {
                addFile(container);
            } else {
                // Если это папка, найдем контейнер для элементов папки
                const folderItems = container.querySelector('.folder-items');
                if (folderItems) {
                    addFile(folderItems);
                }
            }
        }
    }
    
    // Функция для добавления папки по указанному пути
    function addFolderToPath(path) {
        let container;
        
        if (path === 'root') {
            // Добавление в корневой каталог
            container = structureContainer;
        } else {
            // Разбиваем путь на части
            const pathParts = path.split('/');
            
            // Находим соответствующий контейнер папки
            container = findFolderByPath(pathParts);
        }
        
        if (container) {
            // Если это корневой контейнер
            if (container === structureContainer) {
                addFolder(container);
            } else {
                // Если это папка, найдем контейнер для элементов папки
                const folderItems = container.querySelector('.folder-items');
                if (folderItems) {
                    addFolder(folderItems);
                }
            }
        }
    }
    
    // Функция для поиска папки по пути
    function findFolderByPath(pathParts) {
        let currentContainer = structureContainer;
        let currentPath = [];
        
        // Проходим по частям пути
        for (let i = 0; i < pathParts.length; i++) {
            const folderName = pathParts[i];
            currentPath.push(folderName);
            
            // Поиск папки на текущем уровне
            let found = false;
            const folders = currentContainer.querySelectorAll('.folder-item');
            
            for (const folder of folders) {
                const nameInput = folder.querySelector('.folder-name');
                if (nameInput && nameInput.value === folderName) {
                    // Нашли папку, перемещаемся внутрь нее
                    currentContainer = folder;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                console.error(`Папка ${currentPath.join('/')} не найдена`);
                return null;
            }
        }
        
        return currentContainer;
    }
    
    // Функция для открытия файла по пути
    function openFileByPath(path) {
        // Разбиваем путь на части
        const pathParts = path.split('/');
        const fileName = pathParts.pop(); // Последняя часть - имя файла
        
        // Находим файл
        let fileElement = null;
        
        if (pathParts.length === 0) {
            // Файл в корневом каталоге
            const files = structureContainer.querySelectorAll('.file-item');
            for (const file of files) {
                const nameInput = file.querySelector('.file-name');
                if (nameInput && nameInput.value === fileName) {
                    fileElement = file;
                    break;
                }
            }
        } else {
            // Файл внутри папки
            const folderContainer = findFolderByPath(pathParts);
            if (folderContainer) {
                // Развернем все родительские папки
                if (folderContainer !== structureContainer) {
                    // Для корневой папки это не нужно
                    const folderContent = folderContainer.querySelector('.folder-content');
                    const toggleButton = folderContainer.querySelector('.toggle-folder-btn');
                    
                    if (folderContent && folderContent.style.display === 'none' && toggleButton) {
                        toggleButton.click(); // Имитируем нажатие кнопки разворачивания
                    }
                }
                
                const folderItems = folderContainer.querySelector('.folder-items');
                if (folderItems) {
                    const files = folderItems.querySelectorAll('.file-item');
                    for (const file of files) {
                        const nameInput = file.querySelector('.file-name');
                        if (nameInput && nameInput.value === fileName) {
                            fileElement = file;
                            break;
                        }
                    }
                }
            }
        }
        
        // Открываем файл в структуре проекта
        if (fileElement) {
            // Разворачиваем файл, если он свернут
            const fileContent = fileElement.querySelector('.file-content');
            const toggleButton = fileElement.querySelector('.toggle-file-btn');
            
            if (fileContent && fileContent.style.display === 'none' && toggleButton) {
                toggleButton.click(); // Имитируем нажатие кнопки разворачивания
            }
            
            // Прокручиваем страницу к файлу
            fileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Добавляем более заметную подсветку
            fileElement.classList.add('highlight-item');
            
            // Расширяем эффект подсветки на содержимое файла
            fileContent.classList.add('highlight-content');
            
            // Убираем подсветку через некоторое время
            setTimeout(() => {
                fileElement.classList.remove('highlight-item');
                fileContent.classList.remove('highlight-content');
            }, 2000);
        }
    }
    
    // Функция для открытия/закрытия папки по пути
    function toggleFolderByPath(path) {
        if (path === 'root') {
            // Корневой каталог не разворачиваем
            return;
        }
        
        // Разбиваем путь на части
        const pathParts = path.split('/');
        
        // Находим папку
        const folderElement = findFolderByPath(pathParts);
        
        // Разворачиваем папку, если найдена и свернута
        if (folderElement) {
            const folderContent = folderElement.querySelector('.folder-content');
            const toggleButton = folderElement.querySelector('.toggle-folder-btn');
            
            if (folderContent && toggleButton) {
                if (folderContent.style.display === 'none') {
                    toggleButton.click(); // Имитируем нажатие кнопки разворачивания
                }
                
                // Прокручиваем страницу к папке
                folderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Добавляем подсветку для наглядности
                folderElement.classList.add('highlight-item');
                setTimeout(() => {
                    folderElement.classList.remove('highlight-item');
                }, 2000);
            }
        }
    }

    // Функция для наблюдения за изменениями в структуре проекта
    function setupStructureObserver() {
        // Создаем наблюдатель за DOM-изменениями
        const observer = new MutationObserver(function(mutations) {
            // Обновляем отображение дерева при изменении структуры
            updateTreeView();
        });
        
        // Настройка наблюдателя: следим за добавлением/удалением дочерних элементов и изменениями атрибутов
        const config = { 
            childList: true, 
            subtree: true, 
            attributes: true,
            attributeFilter: ['value'] 
        };
        
        // Начинаем наблюдение за контейнером структуры
        observer.observe(structureContainer, config);
        
        // Добавляем обработчики событий для полей ввода
        structureContainer.addEventListener('input', function(e) {
            if (e.target.matches('.file-name, .folder-name')) {
                // Если изменилось имя файла или папки, обновляем дерево
                updateTreeView();
            }
        });
        
        // Также обновляем дерево при изменении названия проекта
        projectNameInput.addEventListener('input', updateTreeView);
        
        // Добавляем обработчик событий для интерактивных элементов дерева
        if (treeOutput) {
            treeOutput.addEventListener('click', handleTreeInteraction);
        }
    }

    // Инициализируем наблюдение за структурой, если есть элементы для отображения дерева
    if (treeOutput) {
        setupStructureObserver();
        updateTreeView();
    }

    // Функция для открытия модального окна редактирования файла
    function openFileEditModal(fileElement) {
        if (!fileElement) return;
        
        // Создаем модальное окно, если его нет
        if (!createFileEditModalIfNeeded()) {
            console.error("Не удалось создать модальное окно редактирования файла");
            return;
        }
        
        currentEditingFile = fileElement;
        
        // Получаем данные файла
        const fileName = fileElement.querySelector('.file-name').value;
        const fileDescription = fileElement.querySelector('.file-description').value || '';
        const ioPairs = fileElement.querySelectorAll('.mock-pair');
        
        // Обновляем заголовок модального окна
        if (fileEditTitle) {
            fileEditTitle.textContent = `Редактирование файла "${fileName}"`;
        }
        
        // Заполняем поля модального окна
        if (modalFileName) {
            modalFileName.value = fileName;
        }
        if (modalFileDescription) {
            modalFileDescription.value = fileDescription;
        }
        
        // Очищаем контейнер пар ввод-вывод
        if (modalIoPairs) {
            modalIoPairs.innerHTML = '';
            
            // Добавляем пары ввод-вывод из файла
            ioPairs.forEach(pair => {
                const inputMock = pair.querySelector('.file-input-mock')?.value || '';
                const outputMock = pair.querySelector('.file-output-mock')?.value || '';
                addModalPairWithData(inputMock, outputMock);
            });
        }
        
        // Открываем модальное окно
        fileEditModal.classList.add('active');
    }
    
    // Функция для закрытия модального окна редактирования файла
    function closeFileEditModal() {
        if (!fileEditModal) return;
        
        fileEditModal.classList.remove('active');
        currentEditingFile = null;
    }
    
    // Функция для добавления новой пары ввод-вывод в модальное окно
    function addModalPair() {
        // Создаем модальное окно, если его нет
        if (!createFileEditModalIfNeeded()) {
            console.error("Не удалось создать модальное окно редактирования файла");
            return;
        }
        
        addModalPairWithData('', '');
    }
    
    // Функция для добавления пары ввод-вывод с данными в модальное окно
    function addModalPairWithData(inputMock, outputMock) {
        // Создаем модальное окно, если его нет
        if (!createFileEditModalIfNeeded()) {
            console.error("Не удалось создать модальное окно редактирования файла");
            return;
        }
        
        if (!modalIoPairs) {
            console.error("Контейнер для пар ввод-вывод не найден");
            return;
        }
        
        const pairContainer = document.createElement('div');
        pairContainer.className = 'mock-pair';
        
        pairContainer.innerHTML = `
            <div class="mock-header">
                <div class="mock-header-actions">
                    <button type="button" class="remove-pair-btn btn-icon">✖</button>
                </div>
            </div>
            <div class="mock-io-container">
                <div class="mock-io-item">
                    <label>Вход:</label>
                    <textarea class="file-input-mock" placeholder='{ "example": "value" }'>${inputMock}</textarea>
                </div>
                <div class="mock-io-arrow">→</div>
                <div class="mock-io-item">
                    <label>Выход:</label>
                    <textarea class="file-output-mock" placeholder='{ "result": "value" }'>${outputMock}</textarea>
                </div>
            </div>
        `;
        
        // Добавляем обработчик для кнопки удаления пары
        const removeBtn = pairContainer.querySelector('.remove-pair-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                pairContainer.remove();
            });
        }
        
        // Добавляем пару в контейнер
        modalIoPairs.appendChild(pairContainer);
    }
    
    // Функция для сохранения изменений файла
    function saveFileEdit() {
        // Создаем модальное окно, если его нет
        if (!createFileEditModalIfNeeded()) {
            console.error("Не удалось создать модальное окно редактирования файла");
            return;
        }
        
        if (!currentEditingFile) {
            console.error("Нет текущего редактируемого файла");
            return;
        }
        
        // Проверяем наличие необходимых элементов в модальном окне
        if (!modalFileName || !modalFileDescription || !modalIoPairs) {
            console.error("Не найдены элементы формы для редактирования файла");
            return;
        }
        
        // Получаем данные из модального окна
        const fileName = modalFileName.value;
        const fileDescription = modalFileDescription.value;
        
        // Проверяем наличие необходимых элементов в файле
        const fileNameInput = currentEditingFile.querySelector('.file-name');
        const fileDescriptionInput = currentEditingFile.querySelector('.file-description');
        const filePairsContainer = currentEditingFile.querySelector('.io-pairs');
        
        if (!fileNameInput || !fileDescriptionInput || !filePairsContainer) {
            console.error("Не найдены элементы файла для обновления");
            closeFileEditModal();
            return;
        }
        
        // Обновляем данные файла
        fileNameInput.value = fileName;
        fileDescriptionInput.value = fileDescription;
        
        // Обновляем заголовок файла
        updateFileHeaderInfo(currentEditingFile);
        
        // Получаем пары ввод-вывод из модального окна
        const modalPairs = modalIoPairs.querySelectorAll('.mock-pair');
        
        // Очищаем контейнер пар в файле
        filePairsContainer.innerHTML = '';
        
        // Добавляем пары из модального окна в файл
        modalPairs.forEach(modalPair => {
            const inputMock = modalPair.querySelector('.file-input-mock')?.value || '';
            const outputMock = modalPair.querySelector('.file-output-mock')?.value || '';
            
            // Создаем новую пару в файле
            const newPair = document.createElement('div');
            newPair.className = 'mock-pair';
            
            newPair.innerHTML = `
                <div class="mock-header">
                    <div class="mock-header-actions">
                        <button type="button" class="remove-pair-btn btn-icon">✖</button>
                    </div>
                </div>
                <div class="mock-io-container">
                    <div class="mock-io-item">
                        <label>Вход:</label>
                        <textarea class="file-input-mock" placeholder='{ "example": "value" }'>${inputMock}</textarea>
                    </div>
                    <div class="mock-io-arrow">→</div>
                    <div class="mock-io-item">
                        <label>Выход:</label>
                        <textarea class="file-output-mock" placeholder='{ "result": "value" }'>${outputMock}</textarea>
                    </div>
                </div>
            `;
            
            // Добавляем обработчик для кнопки удаления пары
            const removeBtn = newPair.querySelector('.remove-pair-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    newPair.remove();
                });
            }
            
            // Добавляем пару в контейнер файла
            filePairsContainer.appendChild(newPair);
        });
        
        // Обновляем текстовую структуру
        updateTreeView();
        
        // Показываем сообщение об успешном сохранении
        showMessage('Файл успешно обновлен', 'success');
        
        // Закрываем модальное окно
        closeFileEditModal();
    }
}); 