def standardize_column_names(df):
    """
    Standardize column names by removing extra spaces and fixing spellings
    """
    # Create a mapping of old names to new names
    column_mapping = {
        ' Age (yrs)': 'Age (yrs)',
        'Age (yrs)': 'Age (yrs)',
        ' Height(Cm)': 'Height(Cm)',
        'Height(Cm)': 'Height(Cm)',
        'Marriage Status (Yrs)': 'Marriage Status (Yrs)',
        'Marraige Status (Yrs)': 'Marriage Status (Yrs)'
    }
    
    # Rename columns if they exist in the dataframe
    for old_name, new_name in column_mapping.items():
        if old_name in df.columns:
            df = df.rename(columns={old_name: new_name})
    
    return df

def preprocess_data(df):
    """
    Apply all preprocessing steps to the dataframe
    """
    # Standardize column names
    df = standardize_column_names(df)
    
    return df
