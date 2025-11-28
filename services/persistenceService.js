const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';
const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE_NAME = 'pdf_vectors';

/**
 * Initialize Supabase table for vector storage
 * This should be run once to set up the database schema
 */
async function initializeDatabase() {
    try {
        // Check if table exists by trying to query it
        const { error } = await supabase.from(TABLE_NAME).select('id').limit(1);

        if (error && error.code === '42P01') {
            console.log('Table does not exist. Please create it using the Supabase dashboard.');
            console.log('Run this SQL in Supabase SQL Editor:');
            console.log(`
CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
  id SERIAL PRIMARY KEY,
  pdf_filename TEXT NOT NULL,
  page_content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdf_filename ON ${TABLE_NAME}(pdf_filename);
      `);
            return false;
        }

        console.log('✓ Supabase table ready');
        return true;
    } catch (error) {
        console.error('Database initialization error:', error.message);
        return false;
    }
}

/**
 * Save vector store documents to Supabase
 * @param {MemoryVectorStore} vectorStore - The vector store to persist
 * @param {string} pdfFileName - Original PDF file name
 */
async function saveVectorStore(vectorStore, pdfFileName) {
    try {
        // Delete existing entries for this PDF
        await supabase.from(TABLE_NAME).delete().eq('pdf_filename', pdfFileName);

        // Get all documents from the vector store
        const documents = vectorStore.memoryVectors;

        // Prepare data for insertion
        const records = documents.map(doc => ({
            pdf_filename: pdfFileName,
            page_content: doc.content,
            metadata: doc.metadata || {}
        }));

        // Insert in batches (Supabase has limits)
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const { error } = await supabase.from(TABLE_NAME).insert(batch);

            if (error) throw error;
        }

        console.log(`✓ Saved to Supabase: ${pdfFileName} (${documents.length} chunks)`);
        return true;
    } catch (error) {
        console.error('Error saving to Supabase:', error.message);
        return false;
    }
}

/**
 * Load vector store documents from Supabase
 * @returns {Promise<Object|null>} - Metadata object with documents or null
 */
async function loadVectorStoreMetadata() {
    try {
        // Get the most recent PDF by created_at
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            console.log('No saved vectors found in Supabase');
            return null;
        }

        // Group by PDF filename (in case there are multiple)
        const pdfFileName = data[0].pdf_filename;
        const pdfDocuments = data.filter(doc => doc.pdf_filename === pdfFileName);

        return {
            pdfFileName,
            timestamp: data[0].created_at,
            documentCount: pdfDocuments.length,
            documents: pdfDocuments.map(doc => ({
                pageContent: doc.page_content,
                metadata: doc.metadata || {}
            }))
        };
    } catch (error) {
        console.error('Error loading from Supabase:', error.message);
        return null;
    }
}

/**
 * Check if a saved vector store exists in Supabase
 * @returns {Promise<boolean>}
 */
async function hasSavedVectorStore() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('id')
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    } catch (error) {
        console.error('Error checking Supabase:', error.message);
        return false;
    }
}

/**
 * Clear all saved vectors from Supabase
 * @param {string} pdfFileName - Optional: Clear only specific PDF
 */
async function clearVectorStore(pdfFileName = null) {
    try {
        let query = supabase.from(TABLE_NAME).delete();

        if (pdfFileName) {
            query = query.eq('pdf_filename', pdfFileName);
        } else {
            // Delete all - we need to use a condition
            query = query.neq('id', 0); // Always true condition
        }

        const { error } = await query;

        if (error) throw error;

        console.log(`✓ Cleared vectors from Supabase${pdfFileName ? ': ' + pdfFileName : ''}`);
        return true;
    } catch (error) {
        console.error('Error clearing Supabase:', error.message);
        return false;
    }
}

module.exports = {
    initializeDatabase,
    saveVectorStore,
    loadVectorStoreMetadata,
    hasSavedVectorStore,
    clearVectorStore
};
